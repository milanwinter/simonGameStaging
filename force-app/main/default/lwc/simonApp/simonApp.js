import { LightningElement, track} from 'lwc';

import boopURL from '@salesforce/resourceUrl/boop'; 
import successURL from '@salesforce/resourceUrl/success'; 
import failURL from '@salesforce/resourceUrl/failure';
import firstNoteURL from '@salesforce/resourceUrl/firstNote';
import secondNoteUrl from '@salesforce/resourceUrl/secondNote';
import thirdNoteUrl from '@salesforce/resourceUrl/thirdNote';
import fourthNoteUrl from '@salesforce/resourceUrl/forthNote';

import getScores from '@salesforce/apex/SimonAppController.getScores';
import createScore from '@salesforce/apex/SimonAppController.createScore';

import scoreField from '@salesforce/schema/Score__c.Score__c';
import nameField from '@salesforce/schema/Score__c.Player_Name__c'

const PLAYERS_TURN = "Your Turn";
const SIMONS_TURN = "Simon's Turn";

const GameState = {
    IN_PROGRESS:"in progress",
    PAUSED:"paused",
    NO_GAME:"no game"
}

const COLOR_SCHEMA_TYPES = {
    DEFAULT: 'DEFAULT'
}

const MODAL_CLASSES = {
    OPEN: {
        MODAL: 'slds-modal slds-fade-in-open',
        BACKDROP: "slds-backdrop slds-backdrop_open"
    },
    CLOSED: {
        MODAL: 'slds-modal',
        BACKDROP: 'slds-backdrop'
    }
}

export default class SimonApp extends LightningElement {

    // @desc : the class for the modal
    modalClass = MODAL_CLASSES.CLOSED.MODAL

    // @desc : the class for the modal's backdrop
    backdropClass = MODAL_CLASSES.CLOSED.BACKDROP

    // @desc : <number> score from last game
    score = 0;

    // @desc : <array> list of score data
    @track
    scoreboard;
    nameApiName = nameField.fieldApiName;
    scoreApiName = scoreField.fieldApiName;
    scoreboardColumns = [
        { label: 'Player Name', fieldName: this.nameApiName},
        { label: 'Highest Level', fieldName: this.scoreApiName}
    ];

    // @desc : <string>
    playerName = '';

    // @desc : <object> color schemas for Simon
    colorSchemas = {
        DEFAULT: ["#00e1ff", "#eded00", "#0f5", "#ff002b"]
    }

    // @desc : <string> the selected color schema
    selectedSchema = COLOR_SCHEMA_TYPES.DEFAULT;

    /* @desc: getters for the specific colors */
    get topLeftColor() {
        return this.colorSchemas[this.selectedSchema][0];
    }

    get topRightColor() {
        return this.colorSchemas[this.selectedSchema][1];
    }

    get bottomRightColor() {
        return this.colorSchemas[this.selectedSchema][2];
    }

    get bottomLeftColor() {
        return this.colorSchemas[this.selectedSchema][3];
    }

    get gameStarted() {
        return this.gameState === GameState.IN_PROGRESS || this.gameState === GameState.PAUSED;
    }

    // @desc : <bool> returns whether the game is paused or not
    get gamePaused() {
        return this.gameState === GameState.PAUSED;
    }

    gameState = GameState.NO_GAME;

    // @desc : <string> the URL address of the boop sound that plays when a section is clicked
    boopSound = boopURL;

    // @desc : <array> the current path for the user to follow
    @track
    currentPath = [];

    // @desc: <string> who's turn it is at the moment(either simon or user)
    whosTurn;

    // @desc : <number> number of correct clicks a player has made on the current session
    pathClickCount = 0;

    simonsTurnInterval = null;

    // @desc : <number> the current level the user is on
    get level() {
        return this.currentPath.length;
    }

    onChange(e) {
        this[e.target.name] = e.target.value;
    }

    async submitScore(e) {
        e.preventDefault();

        if(!this.playerName) {
            alert('Enter Player Name');
            return;
        }

        try {
            await createScore({
                playerName: this.playerName,
                score: this.score
            });

            this.scoreboard = [ ...await getScores()];
        } catch(err) {
            console.error(err);
            alert('Internal Server Error');
            return;
        }

        this.playerName = '';
        this.score = '';
        this.closeScoreModal();
    }

    // @desc : make the boop noise
    makeSound(soundOrigin) {
        const audio = this.template.querySelector('audio');

        switch (soundOrigin) {
            case "bottom-right":
                audio.src = firstNoteURL;
                break;
            case "bottom-left":
                audio.src = secondNoteUrl;
                break;
            case "top-right":
                audio.src = thirdNoteUrl;
                break;
            case "top-left":
                audio.src = fourthNoteUrl;
                break
            case "success":
                audio.src = successURL;
                break
            case "failure":
                audio.src = failURL;
                break;
            default:
                audio.src = ""
                return;
        }

        audio?.play();
    }
    runPathSequenceIsOnLightUpPhase = true;

    // @desc    : generate the next path number in a sequence
    // @returns : <number>
    pathGenerator() { 
        return ['top-left', 'top-right', 'bottom-right', 'bottom-left'][Math.floor(Math.random() * 4)];
    }

    // @desc       : returns an event handler for clicking a section of the game board
    // @className  : <string> name of the class asssociated with this node 
    clickSection(e) {
        
        
        let sectionClicked = e.target.dataset.id;
        this.makeSound(sectionClicked);
        
        if (this.gameState !== GameState.IN_PROGRESS) return;
        if(this.whosTurn !== PLAYERS_TURN) return;

        if(this.currentPath[this.pathClickCount] === sectionClicked) {
            this.pathClickCount++;
            // do something to indicate success
            if(this.pathClickCount === this.currentPath.length) {
                setTimeout(() => {
                    this.makeSound("success");
                },500)
                setTimeout(() => {
                    this.currentPath.push(this.pathGenerator());
                    this.pathClickCount = 0;
                    this.runPathSequence();
                    this.whosTurn = SIMONS_TURN;
                }, 1300);
            }
        } else {
            this.makeSound("failure");
            setTimeout(() => {
                this.score = this.level;
                this.currentPath = [];
                this.pathClickCount = 0;
                this.whosTurn = SIMONS_TURN;
                this.gameState = GameState.NO_GAME;
                this.spawnScoreModal();
            }, 1000);

            // do something to indicate failure
        }
    }

    spawnScoreModal() {
        this.modalClass = MODAL_CLASSES.OPEN.MODAL;
        this.backdropClass = MODAL_CLASSES.OPEN.BACKDROP;
    }

    closeScoreModal() {
        this.modalClass = MODAL_CLASSES.CLOSED.MODAL;
        this.backdropClass = MODAL_CLASSES.CLOSED.BACKDROP;
    }

    runPathSequence() {
        console.log('got into run path sequence');
        let index = 0;
        this.runPathSequenceIsOnLightUpPhase = true;
        this.simonsTurnInterval = setInterval(()=> {
    

            let className = '.' + this.currentPath[index]
            let node = this.template.querySelector(className);

            if (this.runPathSequenceIsOnLightUpPhase) {
                this.makeSound(this.currentPath[index]);
                node?.classList.add('current-section');
            } else {
                this.template.querySelector('.current-section')?.classList.remove('current-section');
                if(index === this.currentPath.length-1) {
                    clearInterval(this.simonsTurnInterval);
                    setTimeout(() => {
                        this.whosTurn = PLAYERS_TURN;  
                    }, 500)
                }

                index ++;

            }
            
            this.runPathSequenceIsOnLightUpPhase = !this.runPathSequenceIsOnLightUpPhase;
        }, 300)
        
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
        this.gameState = GameState.IN_PROGRESS;
       
        
    }

    endGame() {
        this.currentPath = [];
        this.pathClickCount = 0;
        this.whosTurn = SIMONS_TURN;
        this.gameState = GameState.NO_GAME;
        clearInterval(this.simonsTurnInterval);
        this.template.querySelector('.current-section')?.classList.remove('current-section');
    }

    pauseGame() {
        if (!this.gameStarted) return;
        
        this.gameState = (this.gameState === GameState.PAUSED) ? GameState.IN_PROGRESS : GameState.PAUSED;
    }

    async connectedCallback() {
        console.log(scoreField, nameField);
        try {
            this.scoreboard = [...await getScores()];
        } catch(err) {
            this.scoreboard = null;
        }
    }
}