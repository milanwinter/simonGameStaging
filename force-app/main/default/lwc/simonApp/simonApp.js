import { LightningElement, track} from 'lwc';

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
        console.log("path generator", ['top-left', 'top-right', 'bottom-right', 'bottom-left'][Math.floor(Math.random() * 4)])
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
                if(this.pathClickCount === this.currentPath.length){
                    alert('next level');
                    this.currentPath.push(this.pathGenerator());
                    this.pathClickCount = 0;
                    this.runPathSequence()

                }
            } else {
                this.currentPath = [];
                this.pathClickCount = 0;
                alert('you failed');
                // do something to indicate failure
            }
        }
    }

    runPathSequence() {
        console.log('got into run path sequence');
        let index = 0;
        const interval = setInterval(()=> {
            console.log('inside the interval', this.currentPath.length);
            console.log('index',index);
            this.template.querySelector('.current-section')?.classList.remove('current-section');
            let className = '.' + this.currentPath[index]
            let node = this.template.querySelector(className);
            
            node? node.classList.add('current-section') : console.log('node dont exist');
            if(index === this.currentPath.length-1) {
                clearInterval(interval);
                let timeout = setTimeout(function(){
                 node.classList.remove('current-section');   
                }, 500)
                
            }
            index ++;
        }, 500)
        
    }

    // @desc : start a new game
    startGame() {
        console.log('in start game function');
        if(this.gameStarted) return;
        this.pathClickCount = 0;
        let sections = ['top-left', 'top-right', 'bottom-right', 'bottom-left']
        this.currentPath = []
        this.currentPath.push(sections[Math.floor(Math.random() * 4)]);
        this.currentPath = sections;
        
        let index = 0;
       
        this.runPathSequence();
       
        console.log('last line')
    }

  
}