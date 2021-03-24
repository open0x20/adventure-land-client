function main() {
    // healer tank dd
    log("simple team");

    const masterName = "OrgaWa01";


    if (character.name === masterName) {
        const intervalId = setInterval(() => {
            loot();
            regenHpMp()

            set("master", {
                x: character.x,
                y: character.y,
                name: character.name
            });

            const target = get_targeted_monster();

            if (!target) return;

            set("target", {
                x: target.x,
                y: target.y,
                id: target.id
            });

            if (!character.moving && !is_in_range(target)) {
                move(
                    character.x+(target.x-character.x)/2,
                    character.y+(target.y-character.y)/2
                );
                return;
            }
            
            handleBasicAttack(target);
        },1000/4);
        Loader.appendIntervalId(intervalId);

    } else {
        // slave

        let pathFinding = false;
        const intervalId = setInterval(() => {
            loot();
            regenHpMp()
            const simpleMaster = get("master");
            const simpleTarget = get("target");

            if (simpleTarget) {
                const target = parent.entities[simpleTarget.id];

                //target does not exist (dead)
                if (!target) {
                    set("target", null);
                    return;
                };

                //target exists but not in range, go to target.
                if (!pathFinding && !character.moving && !is_in_range(target)) {

                    //my own xmove
                    if(can_move_to(target.x,target.y)) return move(target.x,target.y);
                    pathFinding = true;
                    smart_move(target.x,target.y, () => {
                        pathFinding = false;
                    })
                    return;
                }

                // there is a target, it is in range => attack.
                handleBasicAttack(target);
                return;
            }

            //no path finding while moving
            if (character.moving || pathFinding) return;

            // there is a master but no target, go to master.
            if (!pathFinding && simpleMaster && !simpleTarget) {
                //my own xmove
                if(can_move_to(simpleMaster.x,simpleMaster.y)) return move(simpleMaster.x,simpleMaster.y);
                pathFinding = true;
                smart_move(simpleMaster.x,simpleMaster.y, () => {
                    pathFinding = false;
                })
                return;
            }

            // no target no master
            if (!simpleTarget && !simpleMaster) {
                set_message("S idel");
                return;
            }

            //this code should not be called in normal conditions.
            log("something went wrong");
        }, 1000/4)
        Loader.appendIntervalId(intervalId);
    }
}

function handleBasicAttack(target) {
    if (!target || is_on_cooldown("attack") || !is_in_range(target)) return;
    attack(target);
}

function regenHpMp() {
    if (character.hp < character.max_hp / 2 && !is_on_cooldown("regen_hp")) {
        use_skill("regen_hp");
        return;
    }
    if (character.mp < character.max_mp - 100 && !is_on_cooldown("regen_mp")) {
        use_skill("regen_mp");
        return;
    }
}

main();