
function main() {
    const tank_name = "OrgaWa01";
    const helaer_name = "OrgaPriest01";
    //const dd_name = "OrgaRanger01";

    const partyMembers = [tank_name, helaer_name]

    if (tank_name === character.name) {
        innitTank(partyMembers)
    } else if (helaer_name === character.name) {
        innitHealer(partyMembers)
    } else {
        log("Not implemented jet")
    }
}


function innitHealer(partyMembers) {

    const eventIdHit = character.on("hit", (data) => {
        const potential_enemy = get_monster(data.actor);
        if (!potential_enemy) return;
        send_cm("OrgaWa01", {
            type: "TAUNT_ENEMY",
            enemyId: potential_enemy.id
        });
    })

    let targetId = null;
    const eventIdCm = character.on("cm", (raw_data) => {
        //todo more generic
        if (!raw_data.name === partyMembers[0]) return;
        const message = raw_data.message;
        // a message needs to have a type of requst
        if (!message.type) return;

        switch (message.type) {
            case "REQUEST_HEALING":
                healingRequest(raw_data.name);
                break;
            case "TARGET_UPDATE":
                targetId = message.targetId;
                break;
            default:
                log("unknow type of request")
        }
    });
    Loader.appendCharacterEventId(eventIdCm);
    Loader.appendCharacterEventId(eventIdHit);

    const intervalId = setInterval(() => {
        regenHpMp();
        loot();

        const target = parent.entities[targetId]
        if (!target) return;
        if (!character.moving && !is_in_range(target)) {
            move(
                character.x+(target.x-character.x)/4,
                character.y+(target.y-character.y)/4
            );
            return;
        }

        if (can_attack(target)) {
            attack(target)
        }

    }, 1000/4)
    Loader.appendIntervalId(intervalId);

    function healingRequest(name) {
        if (character.mp < character.max_mp / 5 * 2) return;
        const player = get_player(name);
        if (!player || !is_in_range(player, "heal")) {
            //not implemented jet
        } else if (!is_on_cooldown("heal")){
            heal(player)
        }
    }

}

function innitTank(partyMembers) {

    let searchForNextTarget = true;
    add_bottom_button("toggel_auto_attack", "🗡️", () => {
        if (!searchForNextTarget) set_button_color("toggel_auto_attack", "red")
        if (searchForNextTarget) set_button_color("toggel_auto_attack", "blue")

		searchForNextTarget = !searchForNextTarget;
	});

    const eventIdTauntRequest = character.on("cm", (raw_data) => {
        // generic
        if (raw_data.name != "OrgaPriest01") return;
        const message = raw_data.message;
        if (message.type && message.type === "TAUNT_ENEMY") {
            const target = get_monster(message.enemyId)
            // the character needs to have less than 2 targets (enemies on him) and the taunt skill needs to be avalible (write own function)
            if (target && character.targets <= 1 && !is_on_cooldown("taunt") && is_in_range(target, "taunt") && new Date()>=parent.next_skill.taunt) {
                use_skill("taunt", target);
            }
        }
    })
    Loader.appendCharacterEventId(eventIdTauntRequest);

    //todo more generic
    send_party_invite(partyMembers[1]);

    const intervalId = setInterval(() => {
        regenHpMp();
        loot();

        // request healing ig hp is blow 1/3
        if (character.hp < character.max_hp / 3) {
            send_cm(partyMembers[1], {
                type: "REQUEST_HEALING"
            });
        }

        let target = get_targeted_monster();
        if (searchForNextTarget && !target && character.hp >= (character.max_hp - 50) && !is_on_cooldown("taunt")) {
            
            target = getNextMonster({
                types: ["bee", "goo", "crab"],
                max_att: 35,
                path_check: true
            })
        }

        if (!target) {
            set_message("No target")
            return;
        } else {
            set_message("go")
        }

        if (target.target == partyMembers[1] && !is_on_cooldown("taunt") && is_in_range(target, "taunt")) {
            use_skill("taunt", target);
        } 

        //fix hard coded
        send_cm(partyMembers[1], {
            type: "TARGET_UPDATE",
            targetId: target.id,
            x: target.x,
            y: target.y
        })

        

        if (!character.moving && !is_in_range(target)) {
            move(
                character.x+(target.x-character.x)/2,
                character.y+(target.y-character.y)/2
            );
            return;
        }

        if (!is_on_cooldown("attack") && is_in_range(target)) {
            attack(target)
        }
    },1000/4)
    Loader.appendIntervalId(intervalId);
}


//utils

function regenHpMp() {
    if (character.hp < character.max_hp - 50 && !is_on_cooldown("regen_hp")) {
        use_skill("regen_hp");
        return;
    }
    if (character.mp < character.max_mp - 100 && !is_on_cooldown("regen_mp")) {
        use_skill("regen_mp");
        return;
    }
}

function getNextMonster(args) {

    /*
    args example
    {
        types: ["bee", "goo", "crab"],      // list of monster types
        max_att: 35,                        // max attack value
        target_name: "OrgaMer01",           // monsters target is ...
        not_me: true,                       // monsters target is not the characters name
        path_check: true,                   // can the character move to the target
        max_distance: 800,                  // max distance between character and target
        min_distance: 10                    // min distance between character and target
    }
    */
    
    let target = null;
    let closest_distance_to_target = args.max_distance || 999999;

    const cachEntities = parent.entities;
    for (id in cachEntities) {
        const current = cachEntities[id];
        if (current.type != "monster" || !current.visible || current.dead) continue;
        if (args.types && !args.types.includes(current.mtype)) continue;
        if (args.max_att && current.attack > args.max_att) continue;
        if (args.not_me && current.target && current.target!=character.name) continue;
        if (args.path_check && !can_move_to(current)) continue;
        
        const distance = parent.distance(character,current);
		if(distance <= closest_distance_to_target && distance >= (args.min_distance || 0)) {
            closest_distance_to_target = distance;
            target = current;
        };
    }
    return target;
}

//server function

function on_party_invite(name) {
    //todo local sorage
    if (name && name === "OrgaWa01") accept_party_invite(name);;
}

Loader.subscribe((eventName) => {
    if (eventName === "CODE_MODE_SWITCH") {
        clear_buttons()
    }
});

main()