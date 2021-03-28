function main() {
    const partyLeader = "OrgaWa01";
    //array holds the names of character who can join the party, not the characters in the current party
    const partyMembers = ["OrgaRanger01", "OrgaPriest01"]; 

    set("partyLeader", partyLeader);
    set("potentialPartyMembers", partyMembers);

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
        // parent.party is an infrequently updated object
        send_cm(parent.party, {
            type: "breadcrumb",
            map: character.map,
            x: character.x,
            y: character.y
        })
    }, 1000)
    Loader.appendIntervalId(breadcrumbIntervalId);
}

//todo issue on loader code switch
function followBreadcrumbInnit() {
    const breadcrumbEventId = character.on("cm", (raw_data) => {
        if (raw_data.name != get("partyLeader")) return;
        if (raw_data.message.type != "breadcrumb") return;

        const maxDistanceToLeader = 50;
        const partyLeader = get_player(get("partyLeader"));

        // I'm with my master
        if (partyLeader && Math.ceil(distance(character, partyLeader)) <= maxDistanceToLeader) return;

        // if party leader is out of range
        if (partyLeader && Math.ceil(distance(character, partyLeader)) > maxDistanceToLeader && can_move_to(partyLeader.x, partyLeader.y)) {
            // move to party leader 
            // todo - change max distance for distance characters
            move(partyLeader.x, partyLeader.y);
            return;
        } 
        if (character.moving) {
            const breadcrubs = get(character.name + "-breadcrumbs") || [];
            breadcrubs.unshift(raw_data.message);
            set(character.name + "-breadcrumbs", breadcrubs);
            // todo check if list is to long
        } else {
            const breadcrubs = get(character.name + "-breadcrumbs") || [];
            for (let i = 0; i < breadcrubs.length; i++) {
                if (can_move_to(breadcrubs[i].x, breadcrubs[i].y)) {
                    move(breadcrubs[i].x, breadcrubs[i].y);
                    // remove all old breadcrumbs from the list
                    breadcrubs.splice(i, breadcrubs.length);
                    set(character.name + "-breadcrumbs", breadcrubs);
                    return;
                }
            }
            // can't move to any of the breadcrumbs
            set(character.name + "-breadcrumbs", []);

            // only one character can be in the bank
            if (!get(character.name + "-isPathfinding") && raw_data.message.map != "bank") {
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
        }
    });
    Loader.appendCharacterEventId(breadcrumbEventId);
}


//GUI 
function loadButtons() {
    // auto Targeting button
    // todo implement attack logic
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


//loader events
Loader.subscribe((eventName) => {
    if (eventName === "CODE_MODE_SWITCH") {
        clear_buttons();
    }
})


//server amagic funcions
function on_party_invite(name) {
    if (name && name === get("partyLeader")) accept_party_invite(name);
}

function on_party_request(name) {
    if (get("potentialPartyMembers").includes(name)) accept_party_request(name)
}

main();