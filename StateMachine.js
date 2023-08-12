class StateMachine {
    constructor(context) {
        this.states = {};
        this.currentState = null;
        this.context = context;
    }

    // Add a new state to the state machine
    add(stateName, state) {
        this.states[stateName] = state;
    }

    // Change to a different state
    change(stateName, ...args) {
        if (this.currentState && this.states[this.currentState].exit) {
            this.states[this.currentState].exit.call(this.context);
        }

        this.currentState = stateName;

        if (this.states[this.currentState].enter) {
            this.states[this.currentState].enter.apply(this.context, args);
        }
    }

    // Update the current state
    update(time) {
        if (this.currentState && this.states[this.currentState].update) {
            this.states[this.currentState].update.call(this.context);
        }
    }
}

export default StateMachine;