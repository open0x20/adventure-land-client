function main() {
    const partyLeader = "OrgaWa01";
    //array olds the names of character how can join the party, not the characters in the current party
    const partyMembers = ["OrgaRanger01", "OrgaPriest01"]; 

    set("partyLeader", partyLeader);
    set("partyMembers", partyMembers);

    // set to true to enable auto attacking monsters
    set("autoTargeting", false);
    set(character.name + "-isPathfinding", false);

    //party management
    if (character.name === partyLeader) {
        partyMembers.forEach((memberName) => send_party_invite(memberName));
        // on party request is under server magic functions

        loadButtons();
        spreadBreadcrumbsInit();
        // target selection
        // publish target to active party members
        // listen on target dead
    } else {
        send_party_request(partyLeader);
        // on party invite is under server magic functions

        followBreadcrumbInnit();
        // listen on target updates
        // listen on movement updates (breadkrums)
    }

    // rest should be class / type dependend (healding tornting ...)

}


// movement
function spreadBreadcrumbsInit() {
    const breadcrumbIntervalId = setInterval(() => {
        //log("spread breadcrumb")
        send_cm(get("partyMembers"), {
            type: "breadcrumb",
            map: character.map,
            x: character.x,
            y: character.y
        })
    }, 1000)
    Loader.appendIntervalId(breadcrumbIntervalId);
}

function followBreadcrumbInnit() {
    const breadcrumbEventId = character.on("cm", (raw_data) => {
        if (raw_data.name != get("partyLeader")) return;
        if (raw_data.message.type != "breadcrumb") return;

        const maxDistanceToLeader = 50;
        const partyLeader = get_player(get("partyLeader"));

        // if party leader is out of range
        if (partyLeader && Math.ceil(distance(character, partyLeader)) > maxDistanceToLeader && can_move_to(partyLeader.x, partyLeader.y)) {
            // move to party leader 
            // todo - change max distance for distance characters
            move(partyLeader.x, partyLeader.y);
        } else if (!partyLeader && !get(character.name + "-isPathfinding")) {
            set(character.name + "-isPathfinding", true);

            const destination = {
                map: raw_data.message.map,
                x: raw_data.message.x,
                y: raw_data.message.y
            }

            smart_move(destination, () => {
                set(character.name + "-isPathfinding", false);
            })
        }
        
        
    });
    Loader.appendCharacterEventId(breadcrumbEventId);
}


//GUI 
function loadButtons() {
    // auto Targeting button
    // todo implement attack logic
    // todo add remove buttons on code switch
    function toggleAutoTargetingButtonColor() {
        const autoTargeting = get("autoTargeting");
        if (!autoTargeting) set_button_color("toggel_auto_attack", "blue");
        if (autoTargeting) set_button_color("toggel_auto_attack", "red");
    }
    toggleAutoTargetingButtonColor();
    add_bottom_button("toggel_auto_attack", "🗡️", () => {
        set("autoTargeting", !get("autoTargeting"));
        toggleAutoTargetingButtonColor();
	});
}




//server amagic funcions
function on_party_invite(name) {
    if (name && name === get("partyLeader")) accept_party_invite(name);
}

function on_party_request(name) {
    if (get("partyMembers").includes(name)) accept_party_request(name)
}

main();