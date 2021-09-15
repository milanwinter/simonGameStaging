import { LightningElement, track } from 'lwc';

export default class SimonApp extends LightningElement {

    // @desc : <bool> whether the game is in session or not
    gameStarted = false;

    // @desc : <array> the current path for the user to follow
    @track
    currentPath = [];

    // @desc : <number> number of correct clicks a player has made on the current session
    pathClickCount = 0;

    // @desc    : generate the next path number in a sequence
    // @returns : <number>
    pathGenerator() { 
        return ['top-left', 'top-right', 'bottom-right', 'bottom-left'][Math.floor(Math.random() * 4)];
    }

    // @desc       : returns an event handler for clicking a section of the game board
    // @className  : <string> name of the class asssociated with this node 
    clickSection(className) {
        return (e) => {
            sectionClicked = className.slice(1);
            if(this.currentPath[this.pathClickCount] === sectionClicked) {
                this.pathClickCount++;
                // do something to indicate success
            } else {
                this.currentPath = [];
                this.pathClickCount = 0;
                // do something to indicate failure
            }
        }
    }

    // @desc : start a new game
    startGame() {
        if(this.gameStarted) return;

        console.log('YEEEEEEEEET!!!!!!!');
        this.pathClickCount = 0;
        this.currentPath = [this.pathGenerator()];
        this.gameStarted = true;
    }

    renderedCallback() {
        ['.top-right', '.top-left', '.bottom-right', '.bottom-left']
        .forEach(className => this.template
            .querySelector(className)
            .addEventListener('click', this.clickSection(className)));
        
        this.template
            .querySelector('.start-button')
            .addEventListener('click', this.startGame);
    }

    disconnectedCallback() {
        ['.top-right', '.top-left', '.bottom-right', '.bottom-left']
        .forEach(className => this.template
            .querySelector(className)
            .removeEventListener('click', this.clickSection(className)))
        
        this.template
            .querySelector('.start-button')
            .removeEventListener('click', this.startGame);
    }
}