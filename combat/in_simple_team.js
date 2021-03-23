log("simple team combat v0.1");

// todo choose party leader by max range
const party_leader_name = "OrgaRanger01";

const party_members = [
    "orgasmage",
    "OrgaPriest01",
    "42Taco"
]

const attack_mode = true;

var LoaderEventManager = LoaderEventManager || null;
const intervalIds = [];
const listeners = [];
if (LoaderEventManager) {
    LoaderEventManager.subscribe((event) => {
        if (event === "CODE_MODE_SWITCH") {
            intervalIds.forEach((id) => clearInterval(id));
            character.removeEventListener("cm", );
        }
     })
}

// todo auslagern
// returns a taget in range or null
function get_a_target() {
    const potentioal_target = get_nearest_monster({min_xp:100,max_att:120}) || null;

    // in case there is a potetioal target in range, use it
    if(potentioal_target && is_in_range(potentioal_target)) 
    {
        change_target(potentioal_target);
        return potentioal_target;
    }
    return null;
}

function self_heal_mp() {
    if (character.hp <= character.max_hp - 50 && !is_regen_cooldown()) use_skill("regen_hp");
    if (character.mp <= character.max_mp - 100 && !is_regen_cooldown()) use_skill("regen_mp");
    loot();
}

function is_regen_cooldown() {
    return is_on_cooldown("regen_mp") || is_on_cooldown("regen_hp");
}

if (character.name != party_leader_name) {

    let slave_target;
    set_message("SC - slave");

    const listenerId = character.addListener("cm", (raw_input) => {
        if (raw_input.name != party_leader_name) return;
        const message = raw_input.message;
        slave_target = parent.entities[message.targetUUID];
        // get the party leader
        const party_leader = parent.entities[party_leader_name]
        // go to him
        xmove(party_leader.x, party_leader.y);
    });
    listeners.push(listenerId);


    const intervalID = setInterval(function() {

        self_heal_mp();
    
        if (!slave_target) {
            set_message("SCs - no target");
            return;
        }
        
        if(can_attack(slave_target) && !is_on_cooldown("attack")) {
            set_message("SCs - attack");
            attack(slave_target);
        } else {
            set_message("SCs - out of range");
        }
    },1000/4)
    intervalIds.push(intervalID);

} else {
    // I'm the party leader !!!!

    let target_cach;
    const intervalID = setInterval(function() {
        
        self_heal_mp();;

        if(!attack_mode || character.rip || is_moving(character)) return;

        const target = get_a_target();
        if (!target) {
            set_message("SCm - no target");
        }
        
        if (target && target_cach != target.id) {
            party_members.forEach((name) => {
                send_cm(name, {action:"simple_combat",targetUUID:target.id})
            })
        }

        if (target && target_cach != target.id) {
            target_cach = target.id;
        }

        if(can_attack(target) && !is_on_cooldown("attack")) {
            set_message("SCm - attack");
            attack(target);
        }
    },1000/4);
    intervalIds.push(intervalID);
}


