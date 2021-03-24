/**
 * [REQUIRED]
 * Main method to prevent namespace pollution and redeclaring variables.
 * Will be called at the end of the script.
 */
function main()
{
    /**
     * [REQUIRED]
     * If you use intervals pass the id to the loader.
     * The interval will be cleared on loader mode switch.
     */
    const myRoutine1 = setInterval(() => {
        // do stuff every second
    }, 1000);
    Loader.appendIntervalId(myRoutine1);

    /**
     * [REQUIRED]
     * If you use character events pass the id to the loader.
     * The callback will be unregistered on loader mode switch.
     */
    const myEvent1 = character.on("cm", (raw_input) => {
        // do stuf on "cm" character event
    });
    Loader.appendCharacterEventId(myEvent1);

    /**
     * [OPTIONAL]
     * If you want to clear intervals/events by yourself you can do so
     * by manually registering to events with the subscribe()-method.
     * 
     * A list of events can be found in the loader source code at the top.
     * Currently there is only 1 event "CODE_MODE_SWITCH". It will be triggered
     * if the player manually selects a new code mode via the loader menu.
     * (e.g.: None, Click-Attack, Auto-Attack, ...)
     */
    Loader.subscribe((eventName) => {
        if (eventName === "CODE_MODE_SWITCH") {
            // do some destructor stuff by yourself
        }
    });
    Loader.unsubscribe(theCallbackIDontNeedAnymore);
}

/**
 * [OPTIONAL]
 * Helper functions.
 */
function helper1() 
{

}

function helper2()
{

}

/**
 * Finally the call to the main function.
 * 
 * Import statements have to be inside the main function as well. The only thing
 * allowed outside of the main function are helper functions.
 * 
 * YOUR COMPLETE CODE HAS TO RESIDE IN THE MAIN FUNCTION!
 */
main();