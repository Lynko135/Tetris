"use strict"

// MODEL
 class Game {
     static points = {
         '1': 40,
         '2': 100,
         '3': 300,
         '4': 1200
     };
     score=0;
     lines=0;
     topOut=false;
     playfield = this.createPlayfield();
     activePieceX=0;
     activePieceY=0;

     get level() {
         return Math.floor(this.lines*0.1)+1;
     }

    activePiece=this.createPiece();
    nextPiece = this.createPiece();

    getState() {
        const playfield = this.createPlayfield();
        // const {y: pieceY, x: pieceX, blocks}=this.activePiece;

        for(let y=0; y<this.playfield.length; y++) {
            playfield[y]=[];

            for(let x=0; x<this.playfield[y].length; x++) {
                playfield[y][x]=this.playfield[y][x];
            }
        }
        
        for(let y=0; y<this.activePiece.blocks.length; y++) {
            for(let x=0; x<this.activePiece.blocks[y].length; x++) {
                if (this.activePiece.blocks[y][x]) {
                    playfield[this.activePiece.y+y][this.activePiece.x+x]=this.activePiece.blocks[y][x];
                }
            }
        }

        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            nextPiece: this.nextPiece,
            playfield,
            isGameOver: this.topOut
        };
    }

    reset() {
        this.score=0;
        this.lines=0;
        this.topOut=false;
    }

    createPlayfield() {
        const playfield = [];

        for(let y=0; y<20; y++) {
            playfield[y]=[];

            for(let x=0; x<10; x++) {
                playfield[y][x] = 0;
            }
        }
        return playfield;
    }

    createPiece() {
        const index = Math.floor(Math.random()*7);
        const type = 'IJLOSTZ'[index];
        const piece = {};

        switch(type) {
            case 'I':
                piece.blocks = [
                    [0,0,0,0],
                    [1,1,1,1],
                    [0,0,0,0],
                    [0,0,0,0]
                ];
                break;
            case 'J':
                piece.blocks = [
                    [0,0,0],
                    [2,2,2],
                    [0,0,2]
                ];
                break;
            case 'L':
                piece.blocks = [
                    [0,0,0],
                    [3,3,3],
                    [3,0,0]
                ];
                break;
            case 'O':
                piece.blocks = [
                    [0,0,0,0],
                    [0,4,4,0],
                    [0,4,4,0],
                    [0,0,0,0]
                ];
                break;
            case 'S':
                piece.blocks = [
                    [0,0,0],
                    [0,5,5],
                    [5,5,0]
                ];
                break;
            case 'T': 
                piece.blocks = [
                    [0,0,0],
                    [6,6,6],
                    [0,6,0]
                ];
                break;
            case 'Z':
                piece.blocks = [
                    [0,0,0],
                    [7,7,0],
                    [0,7,7]
                ]
                break;
            default:
                throw new Error('Неизвестный тип фигуры');

        }

        piece.x = Math.floor((10 - piece.blocks[0].length)/2);
        piece.y = -1;
    
        return piece;
    }





    movePieceLeft() {
         this.activePiece.x -=1;
         if (this.hasCollision()) {
             this.activePiece.x +=1;
         }
    }

    movePieceRight() {
        this.activePiece.x +=1;
        if (this.hasCollision()) {
            this.activePiece.x -=1;
        }
    }

    movePieceDown() {
        if(this.topOut) return;

        this.activePiece.y +=1;

        if (this.hasCollision()) {
            this.activePiece.y -=1;
            this.lockPiece();
            const clearedLines = this.clearLines();
            this.updateScore(clearedLines);
            this.updatePieces();
        }

        if(this.hasCollision()) {
            this.topOut=true;
            controller.isPlaying=false;
        }
    }

    hasCollision() {
        const {y: pieceY, x: pieceX, blocks}=this.activePiece;

        for (let y=0; y<blocks.length; y++) {
            for(let x=0; x< blocks[y].length; x++) {
                if(
                    blocks[y][x] && 
                    ((this.playfield[pieceY+y] === undefined || this.playfield[pieceY+y][pieceX+x] === undefined) ||
                    this.playfield[pieceY+y][pieceX+x]))
                     {
                    return true;
                }
            }
         }
         return false;
    }

    lockPiece() {
         const {y: pieceY, x: pieceX, blocks}=this.activePiece;
         for (let y=0; y<blocks.length; y++) {
            for(let x=0; x< blocks[y].length; x++) {
                if(blocks[y][x]) {
                    this.playfield[pieceY+y][pieceX+x] = blocks[y][x];
                }
            }
         }
    }

    rotatePiece() {
        const blocks = this.activePiece.blocks;
        const length = blocks.length;

        const temp = [];
        for (let i = 0; i<length; i++) {
            temp[i] = new Array(length).fill(0);
         }
        for (let y=0; y<length; y++){
            for(let x=0; x<length; x++) {
                temp[x][y] = blocks[length - 1 -y][x];
            }
        }
        this.activePiece.blocks = temp;

        if(this.hasCollision()) {
            this.activePiece.blocks = blocks;
        }
    }

    updatePieces() {
        this.activePiece = this.nextPiece;
        this.nextPiece = this.createPiece();
    }

    clearLines() {
        let lines = [];
        const rows=20;
        const columns = 10;


        for (let y = rows-1; y>=0; y--) {
            let numberOfBlocks = 0;

            for(let x=0; x<columns; x++){
                if(this.playfield[y][x]) {
                    numberOfBlocks +=1;
                }
            }
            if (numberOfBlocks===0) {
                break;
            } else if (numberOfBlocks<columns) {
                continue;
            } else if (numberOfBlocks===columns) {
                lines.unshift(y);
                
            }
        }

        for (let index of lines) {
            this.playfield.splice(index, 1);
            this.playfield.unshift(new Array(columns).fill(0));
        }

        return lines.length;
    }
    
    updateScore(clearLines) {
        if(clearLines > 0) {
            this.score+=Game.points[clearLines] * (this.level+1);
            this.lines+=clearLines;
            view.clearAudioPlay();
        }
        
    }


}

 
//  VIEW
class View {
    static colors =  {
        '1': 'white',
        '2': 'white',
        '3': 'white',
        '4': 'white',
        '5': 'white',
        '6': 'white',
        '7': 'white'
    };
    constructor(element, width, height, rows, columns) {
        this.element=element;
        this.width=width;
        this.height=height;

        this.canvas = document.createElement('canvas');
        this.canvas.height = this.height;
        this.canvas.width = this.width;
        this.ctx = this.canvas.getContext('2d');
        
        this.playfieldBorderWidth=2;
        this.playfieldX=this.playfieldBorderWidth;
        this.playfieldY=this.playfieldBorderWidth;
        this.playfieldWidth=this.width*2/3;
        this.playfieldHeight=height;
        this.playfieldInnerWidth=this.playfieldWidth-this.playfieldBorderWidth*2;
        this.playfieldInnerHeigt=this.playfieldHeight-this.playfieldBorderWidth*2;

        this.blockWidth = this.playfieldInnerWidth/columns;
        this.blockHeight = this.playfieldInnerHeigt/rows;

        this.panelX=this.playfieldWidth + 10;
        this.panelY=0;
        this.panelWidth = this.width/3;
        this.panelHeight = this.height;

        this.element.appendChild(this.canvas);

        this.newGame = document.getElementById('newGameBtn');
        this.recordBt = document.getElementById('RecordBtn');
        this.aboutBt = document.getElementById('AboutBtn');
        this.mainMenu = document.getElementById('mainMenu');

        this.recordModal = document.getElementById('modal_3');
        this.restartBtn = document.getElementById('toMain');
        this.result = document.getElementById('gameResult');
        
        this.MainFont = String(this.width/19);
        this.PanelFont = String(this.width/21);

        this.navPanel = document.getElementById('navBtns');
        this.up = document.getElementById('up');
        this.down = document.getElementById('down');
        this.right = document.getElementById('right');
        this.left = document.getElementById('left');
        this.pause = document.getElementById('pause');
        this.field = document.getElementsByTagName('canvas')[0];

        this.clickAudio = new Audio("http://fe.it-academy.by/Examples/Sounds/button-16.mp3");
        this.clearAudio = new Audio("http://onj3.andrelouis.com/phonetones/unzipped/Meizu%20MX4/notifications/Tapping.mp3");
    }


    clearAudioPlay() {
        this.clearAudio.currentTime=0;
        this.clearAudio.play();
    }
    clickSound() {
        this.clickAudio.currentTime=0;
        this.clickAudio.play();
    }
    renderMainScreen(state) {
        this.clearScreen();
        this.renderPlayField(state);
        this.renderPanel(state);
        
    }

    renderPauseScreen() {
        this.ctx.fillStyle ='white';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.fillStyle='red';
        this.ctx.font=this.MainFont + 'px "Poiret One", cursive';
        this.ctx.textAlign='center';
        this.ctx.fillText('націсніце "ENTER"', this.width/2, this.height/3);
        this.ctx.fillText('або "Працягнуць"', this.width/2, this.height/2.4);
        this.ctx.fillText('Каб працягнуць гульню', this.width/2, this.height/4);

    }
    renderStartScreen() {
        this.ctx.fillStyle='red';
        this.ctx.font=this.MainFont + 'px "Poiret One", cursive';
        this.ctx.textAlign='center';
        this.ctx.textBaseline='middle';
        this.ctx.fillText('Націсніце "ENTER" каб пачаць гульню', this.width/2, this.height/2);
    }
    renderEndScreen() {
        this.clearScreen();
        this.recordModal.classList.add('slideInDown');
        this.result.innerHTML = game.score;
        this.navPanel.style.display = 'none';
    }
    
    
    clearScreen(){
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    renderPlayField( {playfield} ) {
        this.ctx.fillStyle='red';
        this.ctx.fillRect(0,0,this.playfieldWidth, this.playfieldHeight);

        for (let y=0; y<playfield.length; y++) {
            const line=playfield[y];

            for(let x=0; x<playfield.length; x++) {
                const block = line[x];

                if(block) {
                   this.renderBlock(
                        this.playfieldX + (x*this.blockWidth), 
                        this.playfieldY + (y*this.blockHeight), 
                        this.blockWidth, 
                        this.blockHeight, 
                        View.colors[block])
                }
            }
        }

        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = this.playfieldBorderWidth;
        this.ctx.strokeRect(0,0, this.playfieldWidth, this.playfieldHeight);
        
    }

    renderPanel({ level, score, lines, nextPiece}) {
        this.ctx.textAlign='start';
        this.ctx.textBaseline='top';
        this.ctx.fillStyle='red';
        this.ctx.font = this.PanelFont + 'px "Poiret One", cursive';
        
        this.ctx.fillText(`Узровень: ${level}`, this.panelX, this.panelY);
        this.ctx.fillText(`Вынік: ${score}`, this.panelX,this.panelY + 24);
        this.ctx.fillText(`Лініі: ${lines}`, this.panelX,this.panelY + 48);
        this.ctx.fillText(`Наступная:`, this.panelX, this.panelY + 96);

        for (let y=0; y<nextPiece.blocks.length; y++) {
            for(let x=0; x<nextPiece.blocks.length; x++) {
                const block = nextPiece.blocks[y][x];

                if(block) {
                    this.renderBlock(
                        this.panelX+(x*this.blockWidth*0.5),
                        this.panelY+110+(y*this.blockHeight*0.5),
                        this.blockWidth*0.5,
                        this.blockHeight*0.5,
                        View.colors[block]
                    );
                }
            }
        }
    }

    renderBlock(x, y, width, height, color) {
        this.ctx.fillStyle=color;
        this.ctx.strokeStyle='red';
        this.ctx.lineWidth=2;

        this.ctx.shadowColor='white';
        this.ctx.shadowOffsetX=0;
        this.ctx.shadowOffsetY=0;
        this.ctx.shadowBlur=5;

        this.ctx.fillRect(x, y, width, height, color);
        this.ctx.strokeRect(x, y, width, height, color);
    }
    delMenu() {
        this.mainMenu.style.display='none';
    }
    pauseMobileGame() {
            this.field.classList.add('pauseAnim');
            this.up.style.display='none';
            this.right.style.display='none';
            this.left.style.display='none';
            this.down.style.display='none';
            this.pause.value='Працягнуць';
    }
    resumeMobileGame() {
            this.field.classList.remove('pauseAnim');
            this.up.style.display='block';
            this.right.style.display='block';
            this.left.style.display='block';
            this.down.style.display='block';
            this.pause.value='Паўза';
        }
    

    
}



// CONTROLLER
 class Controller {
     constructor(game, view) {
        this.game = game;
        this.view = view;
        this.intervalId = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.isResizing = false;

        
        window.addEventListener('resize', this.resized.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keydown', this.handleKeyUp.bind(this));
        view.newGame.addEventListener('click', this.startGame.bind(this));
        view.restartBtn.addEventListener('click',this.restartGame.bind(this));


        view.newGame.addEventListener('touchstart', this.startMobile.bind(this));
        view.left.addEventListener('touchstart', this.touchleft.bind(this));
        view.right.addEventListener('touchstart', this.touchRight.bind(this));
        view.down.addEventListener('touchstart', this.touchDown.bind(this));
        view.down.addEventListener('touchend', this.touchUp.bind(this));
        view.up.addEventListener('touchstart', this.touchRotate.bind(this));
        view.pause.addEventListener('touchstart', this.mobilePause.bind(this));

        
    }


    mobilePause() {
        if(this.isPlaying) {
            this.stopTimer();
            this.isPlaying=false;
            this.isPaused=true;
            view.pauseMobileGame();
            this.view.clickSound();
        }
        else {
            this.isPlaying=true;
            this.isPaused=false
            this.startTimer();
            view.resumeMobileGame();
            this.view.clickSound();
        }
        
    }
    startMobile() {
        const state = this.game.getState();
        view.newGame.removeEventListener('click', this.startGame.bind(this));
        this.view.delMenu();
        this.view.navPanel.style.display='block';
        this.view.renderMainScreen(state);
        this.play();
        window.navigator.vibrate(50);
        this.view.clickSound();
        this.isPaused=true;
    }

    resized() {
        if (this.isPlaying) {
            this.pause();
            view.pause.value='Працягнуць';
        }
    }

    startGame() {
        this.isPaused=true;
        this.view.clickSound();
        this.view.renderStartScreen();
        this.view.delMenu();
        
    }

    restartGame() {
        this.view.clickSound();
        location.reload();
        window.navigator.vibrate(50);
        
    }

    updateView() {
        const state = this.game.getState();

        if(state.isGameOver) {
            this.view.renderEndScreen(state);
        }

        else if(!this.isPlaying) {
            this.view.renderPauseScreen();
         }
        else {
            this.view.renderMainScreen(this.game.getState(state));
         }
    }

     update() {
        this.game.movePieceDown();
        this.updateView();
    }

     play() {
        this.isPaused=false;
        this.isPlaying=true;
        this.startTimer();
        this.updateView();
    }
     

    pause() {
        this.isPaused=true;
        this.isPlaying=false;
        this.stopTimer();
        this.updateView();
    }

    startTimer() {
        const speed = 1000 - this.game.getState().level*100;

        if(!this.intervalId) {
            this.intervalId = setInterval(() => {
                this.update();
            }, speed > 0 ? speed : 100);
        }
     }

    stopTimer () {
         if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId=null;
         }
        
     }
      reset() {
        this.game.reset();
      }
    

    touchleft() {
        
        window.navigator.vibrate(50);
        this.game.movePieceLeft();
        this.updateView();
    }
    touchRight() {
       
        window.navigator.vibrate(50);
        this.game.movePieceRight();
        this.updateView();
    }
    touchDown() {
        
        window.navigator.vibrate(50);
        this.stopTimer();
        this.game.movePieceDown();
        this.updateView();
    }
    touchRotate() {
        
        window.navigator.vibrate(50);
        this.game.rotatePiece();
        this.updateView();
    }
    touchUp() {
        
        this.startTimer();
    }

     handleKeyDown(event) {
        
        switch(event.keyCode) {
            case 13: {
                if (this.isPlaying) {
                    this.pause();
                    view.clickSound();
                } 
                else if(!this.view.delMenu()) {
                    this.play();
                    view.clickSound();
                }
                break;
                
            }
            case 40: {
                this.stopTimer();
                this.game.movePieceDown();
                this.updateView();
                break;
            } 
            case 38: {
                this.game.rotatePiece();
                this.updateView();
                break;
            }
            case 39: {
                this.game.movePieceRight();
                this.updateView();
                break;
            }
            case 37: {
                this.game.movePieceLeft();
                this.updateView();
                break;
            }
                
        }
     }

     handleKeyUp(event) {
        switch(event.keyCode) {
            case 40: {
                this.startTimer();
                break;
            }
        }
     }


 }


// AJAX

var ajaxHandlerScript="https://fe.it-academy.by/AjaxStringStorage2.php";
var results;
var updatePassword;
var stringName='LYNKO_TETRIS_RECORDS_V3';
var saveB = document.getElementById('SaveBtn');

function showResult() {
    var str='';
    for ( var m=0; m<results.length; m++ ) {
        var playerResult=results[m];
        str+="<div class='resultRow'>"+escapeHTML(playerResult.res)+" - "+escapeHTML(playerResult.name)+"</div> ";
    }
    document.getElementById('results').innerHTML=str;
}

function escapeHTML(text) {
    if ( !text )
        return text;
    text=text.toString()
        .split("&").join("&amp;")
        .split("<").join("&lt;")
        .split(">").join("&gt;")
        .split('"').join("&quot;")
        .split("'").join("&#039;");
    return text;
}

function refreshResult() {
    $.ajax( {
            url : ajaxHandlerScript,
            type : 'POST', dataType:'json',
            data : { f : 'READ', n : stringName },
            cache : false,
            success : readReady,
            error : errorHandler
        }
    );
}

function readReady(callresult) { 
    if ( callresult.error!=undefined )
        alert(callresult.error);
    else {
        results=[];
        if ( callresult.result!="" ) { 
            results=JSON.parse(callresult.result);
            if ( !Array.isArray(results) )
                results=[];
        }
        showResult();
    }
}

function sendResult() {
    var inpName = document.getElementById('toMainBtn').value;
    var inp = document.getElementById('toMainBtn');
    view.clickSound();
    if(inpName==='') {
        inp.classList.add('getLight');
        window.navigator.vibrate(300);
    }
    else {
        updatePassword=Math.random();
        saveB.textContent='вынiк захаваны';
        saveB.classList.remove('closeGameRes');
        saveB.classList.add('resultSaved');
        saveB.removeAttribute('onclick');
        $.ajax( {
            url : ajaxHandlerScript,
            type : 'POST', dataType:'json',
            data : { f : 'LOCKGET', n : stringName,
                p : updatePassword },
            cache : false,
            success : lockGetReady,
            error : errorHandler
            }
        );
    }
    
    
}

function lockGetReady(callresult) {
    if ( callresult.error!=undefined )
        alert(callresult.error);
    else {
        results=[];
        if ( callresult.result!="" ) { 
            results=JSON.parse(callresult.result);
            if ( !Array.isArray(results) )
                results=[];
        }
        var senderName=document.getElementById('toMainBtn').value;
        var playerResult=game.score;
        results.push( { name:senderName, res:playerResult } );
        results=results.sort(function(a, b) {
            return b.res - a.res;
          });
        if ( results.length>14)
            results=results.slice(0,14);

        showResult();

        $.ajax( {
                url : ajaxHandlerScript,
                type : 'POST', dataType:'json',
                data : { f : 'UPDATE', n : stringName,
                    v : JSON.stringify(results), p : updatePassword },
                cache : false,
                success : updateReady,
                error : errorHandler
            }
        );
    }
}
function updateReady(callresult) {
    if ( callresult.error!=undefined )
        alert(callresult.error);
}

function errorHandler(jqXHR,statusStr,errorStr) {
    alert(statusStr+' '+errorStr);
}

refreshResult();



// АНИМАЦИЯ ВСПЛЫВАЮЩИХ ОКОН

function AnimationMenu () {
	const mOpen = document.querySelectorAll('[data-modal]');
	if (mOpen.length == 0) return;
	const overlay = document.querySelector('.overlay'),
		  modals = document.querySelectorAll('.dlg-modal'),
		  mClose = document.querySelectorAll('[data-close]');
	let	mStatus = false;

	for (let el of mOpen) {
		el.addEventListener('click', function(e) {
            view.clickSound();
			let modalId = el.dataset.modal,
				modal = document.getElementById(modalId);
			modalShow(modal);
		});
	}
	for (let el of mClose) {
		el.addEventListener('click', modalClose);
	}
	document.addEventListener('keydown', modalClose);

	function modalShow(modal) {
		overlay.classList.remove('fadeOut');
		overlay.classList.add('fadeIn');
		
		if (typeAnimate === 'slide') {
			modal.classList.remove('slideOutUp');
			modal.classList.add('slideInDown');
			
			
		}
		mStatus = true;
	}

	function modalClose(event) {
		if (mStatus && ( event.type != 'keydown' || event.keyCode === 27 ) ) {
            view.clickSound();

			for (let modal of modals) {
				if (typeAnimate == 'slide') {
					modal.classList.remove('slideInDown');
					modal.classList.add('slideOutUp');
					
				}
			}

			
			overlay.classList.remove('fadeIn');
			overlay.classList.add('fadeOut');
			mStatus = false;
		}
	}
};
AnimationMenu ();


window.onbeforeunload=befUnload;
function befUnload(EO) {
    EO=EO||window.event;
    // если текст изменён, попросим браузер задать вопрос пользователю
    if ( controller.isPlaying || controller.isPaused)
      EO.returnValue='Дакладна хочаце перазагрузіць? Можна так і вынік страціць!';
  };


const root = document.querySelector('#root');
const game = new Game();
const view = new View(root, 480, 640, 20, 10);
const controller = new Controller(game, view);


window.game = game;
window.view =view;
window.controller = controller;
















