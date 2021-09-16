import { LightningElement, track} from 'lwc';

import boopURL from '@salesforce/resourceUrl/boop'; 
import successURL from '@salesforce/resourceUrl/success'; 
import failURL from '@salesforce/resourceUrl/failure';

const PLAYERS_TURN = "Your Turn";
const SIMONS_TURN = "Simon's Turn";

export default class SimonApp extends LightningElement {

    // @desc : <bool> whether the game is in session or not
    gameStarted = false;

    // @desc : <string> the URL address of the boop sound that plays when a section is clicked
    boopSound = boopURL;

    // @desc : <array> the current path for the user to follow
    @track
    currentPath = [];

    // @desc: <string> who's turn it is at the moment(either simon or user)
    whosTurn;

    // @desc : <number> number of correct clicks a player has made on the current session
    pathClickCount = 0;

    //@desc : <bool> whether the section is in the light up phase
    runPathSequenceIsOnLightUpPhase = true;


    // @desc : <number> the current level the user is on
    get level() {
        return this.currentPath.length;
    }

    // @desc : make the boop noise
    makeSound(URL) {
        const audio = this.template.querySelector('audio');
        audio.src = URL;
        audio?.play();
    }

    // @desc    : generate the next path number in a sequence
    // @returns : <number>
    pathGenerator() { 
        return ['top-left', 'top-right', 'bottom-right', 'bottom-left'][Math.floor(Math.random() * 4)];
    }

    // @desc       : returns an event handler for clicking a section of the game board
    // @className  : <string> name of the class asssociated with this node 
    clickSection(e) {
        this.makeSound(boopURL);
        if(this.whosTurn !== PLAYERS_TURN) return;

        let sectionClicked = e.target.dataset.id;
        if(this.currentPath[this.pathClickCount] === sectionClicked) {
            this.pathClickCount++;
            // do something to indicate success
            if(this.pathClickCount === this.currentPath.length) {
                this.makeSound(successURL);
                setTimeout(() => {
                    this.currentPath.push(this.pathGenerator());
                    this.pathClickCount = 0;
                    this.runPathSequence();
                }, 1000);
            }
        } else {
            this.makeSound(failURL);
            setTimeout(() => {
                this.currentPath = [];
                this.pathClickCount = 0;
                this.whosTurn = SIMONS_TURN;
                this.gameStarted = false;
            }, 1000);

            // do something to indicate failure
        }
    }

    runPathSequence() {
        console.log('got into run path sequence');
        let index = 0;
        this.runPathSequenceIsOnLightUpPhase = true;
        const interval = setInterval(()=> {
            this.makeSound(boopURL);
            
            this.template.querySelector('.current-section')?.classList.remove('current-section');
            let className = '.' + this.currentPath[index]
            let node = this.template.querySelector(className);
            
            if(this.runPathSequenceIsOnLightUpPhase) {
                node?.classList.add('current-section');
            } else {

                 if(index === this.currentPath.length-1) {
                    clearInterval(interval);
                    let timeout = setTimeout(() => {
                        node.classList.remove('current-section'); 
                        this.whosTurn = PLAYERS_TURN;  
                    }, 500);
                
                }
            }
            this.runPathSequenceIsOnLightUpPhase = !this.runPathSequenceIsOnLightUpPhase;
            index ++;
        }, 500)
        
    }

    // @desc : start a new game
    startGame() {
        if(this.gameStarted) return;
        this.pathClickCount = 0;
        let sections = ['top-left', 'top-right', 'bottom-right', 'bottom-left']
        this.currentPath = []
        this.currentPath.push(sections[Math.floor(Math.random() * 4)]);
        
        this.whosTurn = SIMONS_TURN;
       
        this.runPathSequence();
        this.gameStarted = true;
       
        
    }

  
}