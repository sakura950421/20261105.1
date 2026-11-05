const BASE_W=1000,BASE_H=720; // 設定遊戲設計時使用的基準畫布寬度與高度。
const BLUE='#8EACCA',PINK='#E8C9C1',NAVY='#4D5146',INK='#4D5146'; // 設定介面使用的藍色、粉色和深色文字色碼。
let uiScale=1,canvasW=BASE_W,canvasH=BASE_H,page='home',stage=0,mode='learn'; // 儲存畫面縮放、畫布尺寸、目前頁面、階段及遊戲模式。
let questions=[],qIndex=0,answered=false,feedback='',explanation='',score=0,selected=-1; // 儲存題目、目前題號、作答狀態、回饋、解說、分數和選取項目。
let buttons=[],voiceButtons=[],cards=[],cardBusy=false,cardMatches=0,dragItem=-1,dragX=0,dragY=0,placed=[]; // 儲存畫面按鈕、語音按鈕、卡片、配對及拖曳分類狀態。
let soundOn=true,audioCtx=null,confirmExit=false,shakeUntil=0,shakeDX=0,shakeDY=0,confetti=[]; // 儲存音效開關、音訊物件、退出視窗、震動和紙花效果狀態。
const STACK_HOME_YAW=.68,STACK_HOME_PITCH=1.18; // 設定積木模型初始視角的水平角和俯仰角。
let stackLearnPage=0,stackYaw=STACK_HOME_YAW,stackPitch=STACK_HOME_PITCH,stackDrag=false,stackLastX=0,stackLastY=0,stackLearnDone=false; // 儲存積木學習頁數、旋轉角度、拖曳狀態和完成狀態。
let solidLearnPage='list',solidLearnKind='triPyramid',solidYaw=.68,solidPitch=.68,solidDrag=false,solidLastX=0,solidLastY=0,netProgress=0,netTarget=0; // 儲存立體圖形學習畫面、形狀、視角和展開動畫狀態。
let shapeLearnStage=0; // 記錄目前正在顯示第一或第二階段的圖形學習卡。

const shapeLearnItems=[ // 建立兩個階段的圖形學習卡資料。
 [ // 開始列出第一階段學習卡。
  {kind:'tri',name:'三角形'}, // 設定三角形卡片使用的圖形種類和名稱。
  {kind:'square',name:'正方形'}, // 設定正方形卡片使用的圖形種類和名稱。
  {kind:'pent',name:'五邊形'}, // 設定五邊形卡片使用的圖形種類和名稱。
  {kind:'hex',name:'六邊形'} // 設定六邊形卡片使用的圖形種類和名稱。
 ], // 結束第一階段的卡片資料。
 [ // 開始列出第二階段學習卡。
  {kind:'tri',name:'正三角形'}, // 設定正三角形卡片使用的圖形種類和名稱。
  {kind:'rightTri',name:'直角三角形'}, // 設定直角三角形卡片使用的圖形種類和名稱。
  {kind:'pent',name:'正五邊形'}, // 設定正五邊形卡片使用的圖形種類和名稱。
  {kind:'hex',name:'正六邊形'} // 設定正六邊形卡片使用的圖形種類和名稱。
 ] // 結束第二階段的卡片資料。
]; // 結束兩階段的學習卡資料。

const learningStacks=[ // 建立第四階段三頁積木學習內容。
 [[2,1,0,1],[1,0,1,0],[0,2,1,0],[1,0,0,1]], // 設定第一組 4×4 積木高度資料。
 [[1,2,1,0],[0,1,0,1],[2,0,1,0],[0,1,2,1]], // 設定第二組 4×4 積木高度資料。
 [[1,0,2,1],[2,1,0,0],[0,2,1,1],[1,0,1,2]] // 設定第三組 4×4 積木高度資料。
]; // 結束三組積木資料。

const solidLearnItems=[ // 建立第三階段可選擇的立體圖形資料。
 {kind:'triPyramid',name:'三角錐'}, // 加入三角錐選項。
 {kind:'squarePyramid',name:'四角錐'}, // 加入四角錐選項。
 {kind:'pentPyramid',name:'五角錐'}, // 加入五角錐選項。
 {kind:'pentPrism',name:'五角柱'}, // 加入五角柱選項。
 {kind:'hexPrism',name:'六角柱'} // 加入六角柱選項。
]; // 結束立體圖形選項資料。
let mixedStages=[true,true,true,true]; // 記錄四個階段是否納入綜合測驗，初始全部啟用。
const stageNames=['認識平面圖形','認識特殊平面圖形','立體圖形與展開圖','積木與三視圖']; // 設定四個階段在介面上顯示的名稱。

const memoryDecks=[ // 建立第一、第二階段翻翻樂使用的卡片牌組。
 [{label:'三角形',shape:'tri',pairKey:'三角形'},{label:'三角形',shape:'tri',pairKey:'三角形'},{label:'正方形',shape:'square',pairKey:'正方形'},{label:'正方形',shape:'square',pairKey:'正方形'},{label:'五邊形',shape:'pent',pairKey:'五邊形'},{label:'五邊形',shape:'pent',pairKey:'五邊形'},{label:'六邊形',shape:'hex',pairKey:'六邊形'},{label:'六邊形',shape:'hex',pairKey:'六邊形'}], // 第一階段的四組相同圖形配對卡。
 [{label:'正三角形',shape:'tri',pairKey:'正三角形'},{label:'正三角形',shape:'tri',pairKey:'正三角形'},{label:'直角三角形',shape:'rightTri',pairKey:'直角三角形'},{label:'直角三角形',shape:'rightTri',pairKey:'直角三角形'},{label:'正五邊形',shape:'pent',pairKey:'正五邊形'},{label:'正五邊形',shape:'pent',pairKey:'正五邊形'},{label:'正六邊形',shape:'hex',pairKey:'正六邊形'},{label:'正六邊形',shape:'hex',pairKey:'正六邊形'}] // 第二階段的四組特殊圖形配對卡。
]; // 結束翻翻樂牌組資料。

const mcqBank=[ // 建立第一階段選擇題的題庫。
 {shape:'tri',shapeName:'三角形',options:['三角形','四邊形','五邊形','圓形'],answer:0,why:'三角形有三條邊和三個角。'}, // 三角形辨識題，正確答案是選項索引 0。
 {shape:'square',shapeName:'正方形',options:['長方形','正方形','梯形','三角形'],answer:1,why:'正方形四邊等長，四個角都是直角。'}, // 正方形辨識題，正確答案是選項索引 1。
 {shape:'hex',shapeName:'六邊形',options:['四邊形','五邊形','六邊形','八邊形'],answer:2,why:'六邊形有六條邊。'} // 六邊形辨識題，正確答案是選項索引 2。
]; // 結束選擇題題庫。

const matchBank=[ // 建立圖形和名稱配對題的題庫。
 {items:[['tri','三角形'],['square','正方形'],['pent','五邊形']],why:'依照圖形邊數和形狀配對。'}, // 第一組包含三角形、正方形和五邊形。
 {items:[['rect','長方形'],['hex','六邊形'],['trap','梯形']],why:'觀察邊和角，找出相符名稱。'}, // 第二組包含長方形、六邊形和梯形。
 {items:[['diamond','菱形'],['para','平行四邊形'],['circle','圓形']],why:'觀察邊的方向和曲線，找出相符名稱。'} // 第三組包含菱形、平行四邊形和圓形。
]; // 結束配對題題庫。

const classifyBank=[ // 建立第二階段圖形分類題的題庫。
 {prompt:'把圖形拖到「三角形」或「四邊形」區。',items:[['tri','三角形'],['trap','四邊形'],['rightTri','三角形']],bins:['三角形','四邊形']}, // 第一題依照圖形邊數分成三角形和四邊形。
 {prompt:'把圖形拖到「正多邊形」或「其他多邊形」區。',items:[['pent','正多邊形'],['para','其他多邊形'],['hex','正多邊形']],bins:['正多邊形','其他多邊形']}, // 第二題依照是否為正多邊形分類。
 {prompt:'依照邊數，把圖形分到「三角形」或「四邊形」。',items:[['quad','四邊形'],['tri2','三角形'],['square','四邊形']],bins:['三角形','四邊形']} // 第三題再次依照邊數分類。
]; // 結束分類題題庫。

const solids=[ // 建立立體圖形測驗所用的立體及展開圖資料。
 {name:'正方體',solid:'cube',net:{faces:[{p:[[-1,-1],[0,-1],[0,0],[-1,0]]},{p:[[0,-1],[1,-1],[1,0],[0,0]]},{p:[[1,-1],[2,-1],[2,0],[1,0]]},{p:[[0,-2],[1,-2],[1,-1],[0,-1]]},{p:[[0,0],[1,0],[1,1],[0,1]]},{p:[[0,1],[1,1],[1,2],[0,2]]}]},distractors:['box','triPrism','pyramid']}, // 儲存正方體展開圖和其他立體圖形干擾選項。
 {name:'長方體',solid:'box',net:{faces:[{p:[[-2,-.6],[-.8,-.6],[-.8,.6],[-2,.6]]},{p:[[-.8,-.6],[.2,-.6],[.2,.6],[-.8,.6]]},{p:[[.2,-.6],[1.4,-.6],[1.4,.6],[.2,.6]]},{p:[[1.4,-.6],[2.4,-.6],[2.4,.6],[1.4,.6]]},{p:[[-2,-1.6],[-.8,-1.6],[-.8,-.6],[-2,-.6]]},{p:[[-2,.6],[-.8,.6],[-.8,1.6],[-2,1.6]]}]},distractors:['cube','triPrism','pyramid']}, // 儲存長方體展開圖和其他立體圖形干擾選項。
 {name:'三角柱',solid:'triPrism',net:{faces:[{p:[[-1.5,-.5],[-.5,-.5],[-.5,.5],[-1.5,.5]]},{p:[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]},{p:[[.5,-.5],[1.5,-.5],[1.5,.5],[.5,.5]]},{p:[[-.5,-.5],[.5,-.5],[0,-1.366]]},{p:[[-.5,.5],[.5,.5],[0,1.366]]}]},distractors:['cube','box','pyramid']}, // 儲存三角柱由三個長方形和兩個三角形組成的展開圖。
 {name:'四角錐',solid:'pyramid',net:{faces:[{p:[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]]},{p:[[-.5,-.5],[.5,-.5],[0,-1.5]]},{p:[[.5,-.5],[.5,.5],[1.5,0]]},{p:[[.5,.5],[-.5,.5],[0,1.5]]},{p:[[-.5,.5],[-.5,-.5],[-1.5,0]]}]},distractors:['cube','box','triPrism']} // 儲存四角錐的正方形底面、四個三角形側面及干擾選項。
]; // 結束立體圖形測驗資料。

const stackBank=[ // 建立第四階段積木數量與三視圖題目的積木資料。
 {grid:[[2,1,0],[1,0,1]],why:'高度相加，共五顆積木。'}, // 第一組積木高度及答案說明。
 {grid:[[1,2,1],[0,1,0]],why:'高度相加：1+2+1+1，共五顆。'}, // 第二組積木高度及答案說明。
 {grid:[[3,1],[2,0]],why:'高度相加：3+1+2，共六顆。'} // 第三組積木高度及答案說明。
]; // 結束積木測驗資料。

function setup(){loadGoogleFonts();createCanvas(windowWidth,windowHeight);pixelDensity(1);textFont('Noto Sans HK');updateScale();} // p5.js 啟動時建立畫布、載入字型、設定像素密度並計算縮放。
function loadGoogleFonts(){const a=[['preconnect','https://fonts.googleapis.com'],['preconnect','https://fonts.gstatic.com'],['stylesheet','https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&family=Noto+Sans+HK:wght@100..900&display=swap']];for(const [rel,href] of a){let l=document.createElement('link');l.rel=rel;l.href=href;if(href.includes('fonts.gstatic.com'))l.crossOrigin='anonymous';document.head.appendChild(l);}document.body.style.fontFamily="'Noto Sans HK', sans-serif";} // 加入 Google Fonts 連結，並將網頁預設字型設為 Noto Sans HK。
function windowResized(){resizeCanvas(windowWidth,windowHeight);updateScale();} // 瀏覽器視窗尺寸改變時，調整畫布並重新計算縮放比例。
function updateScale(){uiScale=min(width/BASE_W,height/BASE_H);canvasW=BASE_W*uiScale;canvasH=BASE_H*uiScale;} // 依照視窗大小等比例縮放基準畫布，並記錄實際畫布尺寸。
function draw(){background('#F8F3EA');buttons=[];voiceButtons=[];let sh=millis()<shakeUntil;if(sh){shakeDX=random(-7,7);shakeDY=random(-5,5);}else{shakeDX=0;shakeDY=0;}push();translate((width-canvasW)/2,(height-canvasH)/2);scale(uiScale);translate(shakeDX,shakeDY);if(page==='home')drawHome();else if(page==='stages')drawStages();else if(page==='game')drawGame();else if(page==='result')drawResult();else if(page==='stackLearn')drawStackLearn();else if(page==='solidLearn')drawSolidLearn();else if(page==='shapeLearn')drawShapeLearn();if(confirmExit)drawExitDialog();drawConfetti();pop();} // 每一影格清空並重繪目前頁面，同時處理震動、置中縮放和紙花效果。
function panel(x,y,w,h,c='#FBF8F2',r=22){noStroke();fill(c);rect(x,y,w,h,r);} // 繪製指定位置、尺寸、顏色和圓角半徑的面板。
function chooseFont(t){textFont(/^[\x00-\x7F]*$/.test(String(t))?'Dancing Script':'Noto Sans HK');} // 判斷文字是否全為英文字元，並選擇英文字型或中文字型。
function label(t,x,y,s=22,c=INK,align=CENTER){push();resetMatrix();translate((width-canvasW)/2+shakeDX*uiScale,(height-canvasH)/2+shakeDY*uiScale);scale(uiScale);noStroke();fill(c);chooseFont(t);textAlign(align,CENTER);textSize(s);text(t,x,y);pop();} // 在畫布座標指定位置繪製文字，並套用置中、縮放、震動與字型設定。
function wrapText(t,x,y,w,s=22,c=INK,maxL=3){push();noStroke();fill(c);chooseFont(t);textSize(s);textAlign(CENTER,CENTER);let ls=wrapLines(t,w-24,s).slice(0,maxL);for(let i=0;i<ls.length;i++)text(ls[i],x,y+(i-(ls.length-1)/2)*s*1.35);pop();} // 將文字依寬度切成多行，限制最多行數後繪製。
function wrapLines(t,w,s){chooseFont(t);textSize(s);let a=[],l='';for(const ch of t){if(textWidth(l+ch)>w&&l){a.push(l);l=ch;}else l+=ch;}if(l)a.push(l);return a;} // 逐字測量文字寬度，將內容分行並回傳各行字串。
function addButton(id,x,y,w,h,t,action,opt={}){buttons.push({id,x,y,w,h,text:t,action,...opt});noStroke();fill(opt.fill||'#FBF8F2');rect(x,y,w,h,16);stroke('#DCC9B4');strokeWeight(2);noFill();rect(x,y,w,h,16);noStroke();wrapText(t,x+w/2,y+h/2,w-8,opt.size||20,opt.color||NAVY,2);} // 建立按鈕資料、繪製按鈕背景與邊框，並在按鈕中央排版文字。
function inRect(x,y,r){return x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;} // 判斷指定座標是否落在矩形區域內。
function ptX(x){return(x-(width-canvasW)/2)/uiScale-shakeDX;} // 將視窗上的滑鼠 x 座標換算成遊戲基準座標。
function ptY(y){return(y-(height-canvasH)/2)/uiScale-shakeDY;} // 將視窗上的滑鼠 y 座標換算成遊戲基準座標。
function drawHeader(a,b){panel(28,20,944,74,'#FBF8F2',20);label(a,500,46,25,NAVY);label(b,500,75,15,'#6F776B');} // 繪製每個主要頁面共用的標題和副標題區塊。
function speakShape(n){if(!window.speechSynthesis)return;window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(n);u.lang='zh-TW';u.rate=.85;window.speechSynthesis.speak(u);} // 使用瀏覽器內建語音合成功能，以繁體中文朗讀圖形名稱。
function drawSpeakIcon(n,x,y,s=18){push();noStroke();fill('#F8F3EA');circle(x,y,s*2);fill(NAVY);beginShape();vertex(x-s*.4,y-s*.2);vertex(x-s*.18,y-s*.2);vertex(x+s*.12,y-s*.46);vertex(x+s*.12,y+s*.46);vertex(x-s*.18,y+s*.2);vertex(x-s*.4,y+s*.2);endShape(CLOSE);noFill();stroke(NAVY);strokeWeight(2);arc(x,y,s,s,-PI/3,PI/3);pop();voiceButtons.push({x:x-s,y:y-s,w:s*2,h:s*2,action:()=>speakShape(n)});} // 繪製喇叭圖示，並登記點擊區域與要朗讀的圖形名稱。
function drawHome(){panel(55,55,890,610,'#FBF8F2',34);label('幾何圖形小學堂',500,145,46,NAVY);label('看一看、動手玩，發現圖形的秘密！',500,202,23,'#6F776B');drawShape('hex',500,330,82,'#A8B9A0');drawShape('tri',405,360,65,BLUE);drawShape('cube',595,360,70,PINK);addButton('start',350,465,300,70,'開始學習',()=>page='stages',{fill:PINK,size:26});addButton('sound',395,555,210,48,soundOn?'🔊 音效開啟':'🔇 音效關閉',()=>soundOn=!soundOn);label('適用年齡：小學生｜電腦與平板皆可操作',500,632,16,'#6F776B');} // 繪製遊戲封面、裝飾圖形、開始按鈕、音效開關和適用年齡文字。
function drawStages(){drawHeader('選擇學習階段','先看一題示範，再挑戰六題測驗');for(let i=0;i<4;i++){let y=125+i*113;panel(105,y,790,92,'#FBF8F2',20);label(`第 ${i+1} 階段`,160,y+30,17,'#6F776B');label(stageNames[i],390,y+34,25,NAVY);addButton(`mix${i}`,505,y+22,100,48,mixedStages[i]?'綜合 ✓':'綜合 ○',()=>mixedStages[i]=!mixedStages[i],{size:15});addButton(`learn${i}`,625,y+18,118,55,'學習',()=>startGame(i,'learn'));addButton(`quiz${i}`,760,y+18,118,55,'六題測驗',()=>startGame(i,'quiz'),{fill:PINK});}addButton('mixed',290,590,205,54,'綜合測驗',()=>startGame(0,'mixed'),{fill:'#DCC9B4'});addButton('back',515,590,195,54,'回主畫面',()=>page='home');} // 繪製階段選單，提供各階段綜合選取、學習、測驗、綜合測驗和返回主畫面按鈕。
function startGame(s,m){stage=s;mode=m;score=0;qIndex=0;answered=false;feedback='';selected=-1;confirmExit=false;if(m==='learn'&&s<2){shapeLearnStage=s;page='shapeLearn';return;}if(m==='learn'&&s===2){solidLearnPage='list';page='solidLearn';return;}if(m==='learn'&&s===3){stackLearnPage=0;resetStackView();stackLearnDone=false;page='stackLearn';return;}questions=m==='learn'?[makeQuestion(s,0,true)]:m==='quiz'?buildStageQuiz(s):buildMixedQuiz();page='game';resetQuestion();} // 初始化階段、模式與分數，依學習或測驗模式進入對應頁面並建立題目。
function buildStageQuiz(s){let a=[];if(s===0){for(let k=0;k<3;k++)for(const id of shuffle([0,1,2]).slice(0,2))a.push(makeQuestion(s,k,false,id));}else if(s===2){for(let k=0;k<2;k++)for(const id of shuffle([0,1,2,3]).slice(0,3))a.push(makeQuestion(s,k,false,id));}else for(let k=0;k<2;k++)for(const id of shuffle([0,1,2]).slice(0,3))a.push(makeQuestion(s,k,false,id));return shuffle(a);} // 根據不同階段的題型與題庫索引建立題目，最後打亂題目順序。
function buildMixedQuiz(){let a=[],av=mixedStages.map((v,i)=>v?i:-1).filter(i=>i>=0);if(!av.length)av=[0,1,2,3];for(let i=0;i<6;i++){let s=random(av),k=floor(random(s===0?3:2));a.push(makeQuestion(s,k,false,floor(random(s===2?4:3))));}return shuffle(a);} // 從已勾選階段中隨機抽出六題，若未勾選任何階段則使用全部階段。
function makeQuestion(s,k,learning=false,id=floor(random(3))){if(s===0&&k===0)return{stage:s,type:'memory',deck:memoryDecks[0],title:'翻開卡片，找出同一類圖形！'};if(s===0&&k===1)return{stage:s,type:'mcq',...mcqBank[id],title:'觀察圖形，選出正確答案。'};if(s===0&&k===2){let a=matchBank[id];return{stage:s,type:'matching',...a,rightOrder:shuffle(a.items.map((p,i)=>({label:p[1],itemIndex:i})))};}if(s===1&&k===0)return{stage:s,type:'memory',deck:memoryDecks[1],title:'翻開卡片，找出特殊圖形。'};if(s===1)return{stage:s,type:'classify',...classifyBank[id],title:classifyBank[id].prompt};if(s===2&&k===0){let t=solids[id],c=makeSolidChoices(t);return{stage:s,type:'netToSolid',solid:t,choices:c,answerIndex:c.indexOf(t),title:'觀察展開圖，選出正確立體圖形。'};}if(s===2){let t=solids[id],c=makeSolidChoices(t);return{stage:s,type:'solidToNet',solid:t,choices:c,answerIndex:c.indexOf(t),title:'觀察立體圖，選出正確展開圖。'};}if(s===3&&k===0)return{stage:s,type:'count',stack:stackBank[id],title:'仔細觀察堆疊，算一算積木數量。'};let v=['正視圖','側視圖','俯視圖'][id],c=makeViewChoices(stackBank[id].grid);return{stage:s,type:'view',stack:stackBank[id],view:v,viewChoices:c,answerIndex:c.findIndex(x=>x.name===v),title:`從${['正面','側面','上面'][id]}觀察，選出${v}。`};} // 依階段、題型及題庫索引建立單題物件，包含題目內容、選項和正確答案。
function makeSolidChoices(t){return shuffle([t.solid,...t.distractors].map(k=>solids.find(s=>s.solid===k)));} // 將正確立體與干擾選項轉成物件後打亂順序。
function makeViewChoices(g){return shuffle([{name:'正視圖',data:viewHeights(g,'正視圖')},{name:'側視圖',data:viewHeights(g,'側視圖')},{name:'俯視圖',data:g.map(r=>r.map(v=>v?1:0))}]);} // 根據積木高度資料建立正視、側視和俯視選項並打亂。
function resetQuestion(){answered=false;feedback='';explanation='';selected=-1;cards=[];cardBusy=false;cardMatches=0;placed=[];dragItem=-1;let q=questions[qIndex];if(q.type==='memory')cards=shuffle(q.deck.map((c,i)=>({...c,id:i,up:false,matched:false,flip:0})));} // 重設當前題目的作答狀態，若是翻翻樂則複製並打亂卡片資料。

function drawShapeLearn(){ // 繪製第一或第二階段的圖形學習卡片頁。
 const title=shapeLearnStage===0?'第一階段學習：認識平面圖形':'第二階段學習：認識特殊平面圖形'; // 依目前階段選擇頁面標題。
 drawHeader(title,'看看圖形和名稱，按卡片下方的聲音符號聽名稱。'); // 繪製標題和操作說明。
 panel(70,112,860,500,'#FBF8F2',22); // 繪製包住學習卡片的主要面板。

 const items=shapeLearnItems[shapeLearnStage]; // 取得目前階段的圖形學習卡資料。
 const cardW=350,cardH=170,gapX=34,gapY=22; // 設定卡片寬、高，以及卡片間距。
 const startX=500-(cardW*2+gapX)/2; // 計算兩欄卡片的水平起始位置。
 const startY=225; // 設定第一排卡片的垂直起始位置。

 for(let i=0;i<items.length;i++){ // 逐張處理目前階段的學習卡片。
  const col=i%2,row=floor(i/2); // 依卡片索引計算欄位和列數。
  const x=startX+col*(cardW+gapX); // 計算目前卡片的 x 座標。
  const y=startY+row*(cardH+gapY); // 計算目前卡片的 y 座標。
  const item=items[i]; // 取得目前卡片的圖形種類和名稱。

  panel(x,y,cardW,cardH,'#F8F3EA',18); // 繪製單張卡片的背景。
  drawShape(item.kind,x+cardW/2,y+55,36,'#A8B9A0'); // 在卡片上方繪製圖形。
  label(item.name,x+cardW/2,y+112,20,NAVY); // 在圖形下方顯示名稱。
  drawSpeakIcon(item.name,x+cardW/2,y+146,15); // 繪製聲音按鈕，點擊後朗讀卡片名稱。
 }

 addButton('shapeLearnBack',40,42,135,38,'回階段選單',()=>page='stages',{fill:PINK,size:15}); // 建立返回階段選單的按鈕。
} // 結束圖形學習卡片頁的繪製函式。

function drawGame(){let total=questions.length;drawHeader(mode==='learn'?'學習示範':mode==='mixed'?'綜合測驗':stageNames[stage],`第 ${qIndex+1} 題／${total} 題　答對 ${score} 題`);panel(190,97,620,7,'#DCC9B4',4);panel(190,97,620*(qIndex+1)/total,7,BLUE,4);addButton('exit',44,42,105,38,'退出',()=>confirmExit=true,{fill:PINK,size:16});let q=questions[qIndex];panel(70,108,860,76,'#FBF8F2',18);wrapText(q.title||'',500,145,820,21,NAVY,2);panel(70,198,860,420,'#FBF8F2',22);drawQuestion(q);if(feedback){panel(110,625,590,55,feedback==='答對了！'?BLUE:PINK,15);wrapText(feedback+(answered&&explanation?' '+explanation:''),405,653,560,17,NAVY,2);if(answered)addButton('next',735,625,190,55,qIndex===total-1?'看結果':'下一題',advance,{fill:'#DCC9B4'});}} // 繪製測驗標題、進度條、退出按鈕、題目區、回饋訊息與下一題按鈕。
function drawQuestion(q){if(q.type==='memory')drawMemory();else if(q.type==='mcq')drawMCQ(q);else if(q.type==='matching')drawMatching(q);else if(q.type==='classify')drawClassify(q);else if(q.type==='netToSolid')drawNetToSolid(q);else if(q.type==='solidToNet')drawSolidToNet(q);else if(q.type==='count')drawCount(q);else drawViews(q);} // 依題目種類呼叫相對應的繪製函式。

function drawSolidLearn(){drawHeader('第三階段學習：立體圖形與展開圖',solidLearnPage==='list'?'選擇圖形，或直接進入測驗':'拖曳圖形可自由旋轉');panel(70,112,860,500,'#FBF8F2',22);if(solidLearnPage==='list')drawSolidLearnList();else drawSolidLearnModel();} // 繪製第三階段標題和面板，並依目前狀態顯示形狀清單或立體模型。
function drawSolidLearnList(){label('選擇想認識的立體圖形',500,150,24,NAVY);const pos=[[300,270],[500,270],[700,270],[400,410],[600,410]];for(let i=0;i<solidLearnItems.length;i++){let item=solidLearnItems[i],[x,y]=pos[i];panel(x-78,y-62,156,124,'#F8F3EA',15);drawSolidLearnShape(item.kind,x,y-8,34,0,0,0);label(item.name,x,y+39,17,NAVY);buttons.push({id:`solidPick${i}`,x:x-78,y:y-62,w:156,h:124,action:()=>{solidLearnKind=item.kind;solidLearnPage='model';solidYaw=STACK_HOME_YAW;solidPitch=STACK_HOME_PITCH;netProgress=0;netTarget=0;}});}addButton('solidQuiz',370,510,260,54,'進入第三階段測驗',()=>startGame(2,'quiz'),{fill:PINK,size:20});addButton('solidListBack',40,42,130,38,'回階段選單',()=>page='stages',{fill:PINK,size:15});} // 顯示五種立體圖形選項，並建立選取圖形、進入測驗和返回階段選單的按鈕。
function drawSolidLearnModel(){let item=solidLearnItems.find(s=>s.kind===solidLearnKind);label(item.name,500,153,25,NAVY);label(netTarget===0?'拖曳旋轉；按「展開」觀看每個面如何攤平。':'展開完成後按「闔上」收回。',500,190,16,'#6F776B');updateNetAnimation();drawSolidLearnShape(solidLearnKind,500,375,100,solidYaw,solidPitch,netProgress);addButton('solidBackList',40,42,140,38,'回圖形選單',()=>{solidLearnPage='list';netTarget=0;},{fill:PINK,size:15});if(netProgress<.001&&netTarget===0)addButton('solidReset',300,565,170,48,'重置視角',()=>{solidYaw=STACK_HOME_YAW;solidPitch=STACK_HOME_PITCH;},{fill:'#A8B9A0',size:18});if(netProgress<.001&&netTarget===0)addButton('solidOpen',530,565,170,48,'展開',()=>netTarget=1,{fill:'#DCC9B4',size:18});else if(netProgress>.999&&netTarget===1)addButton('solidClose',415,565,170,48,'闔上',()=>netTarget=0,{fill:PINK,size:18});} // 繪製選定立體、展開提示和返回按鈕，並依展開狀態顯示重置、展開或闔上按鈕。
function updateNetAnimation(){if(netProgress<netTarget)netProgress=min(netTarget,netProgress+.022);else if(netProgress>netTarget)netProgress=max(netTarget,netProgress-.022);} // 每次更新時讓展開進度逐漸移向目標值。
function drawSolidLearnShape(kind,cx,cy,size,yaw,pitch,opened){const faces=getSolidLearnFaces(kind),flat=faces.flatMap(f=>f.flat);const minX=Math.min(...flat.map(p=>p[0])),maxX=Math.max(...flat.map(p=>p[0])),minY=Math.min(...flat.map(p=>p[1])),maxY=Math.max(...flat.map(p=>p[1])),midX=(minX+maxX)/2,midY=(minY+maxY)/2,scaleNet=Math.min(size*.72,460/(maxX-minX),300/(maxY-minY));for(const f of faces){const pts=f.points.map((p,i)=>{const X=p[0]*cos(yaw)-p[1]*sin(yaw),Y=p[0]*sin(yaw)+p[1]*cos(yaw),sy=Y*cos(pitch)+p[2]*sin(pitch),depth=-Y*sin(pitch)+p[2]*cos(pitch);return{x:lerp(cx+X*size,cx+(f.flat[i][0]-midX)*scaleNet,opened),y:lerp(cy-sy*size,cy+(f.flat[i][1]-midY)*scaleNet,opened),z:depth};});f.depth=pts.reduce((s,p)=>s+p.z,0)/pts.length;f.render=pts;}faces.sort((a,b)=>a.depth-b.depth);for(const f of faces){fill(f.color);stroke('#6F776B');strokeWeight(1.5);beginShape();for(const p of f.render)vertex(p.x,p.y);endShape(CLOSE);}} // 將各立體面依旋轉角度和展開進度投影到畫面，依深度排序後繪出。
function polygonFromEdge(p0,p1,n,turnSign){const pts=[p0,p1],dx=p1[0]-p0[0],dy=p1[1]-p0[1],turn=turnSign*TWO_PI/n;let vx=dx,vy=dy;for(let i=2;i<n;i++){const nx=vx*cos(turn)-vy*sin(turn),ny=vx*sin(turn)+vy*cos(turn);pts.push([pts[i-1][0]+nx,pts[i-1][1]+ny]);vx=nx;vy=ny;}return pts;} // 從多邊形的一條邊出發，依轉角逐點計算其餘頂點座標。
function getSolidLearnFaces(kind){ // 依立體圖形種類建立每個面的三維頂點、展開位置和顏色。
 const n=kind==='triPyramid'?3:kind==='squarePyramid'?4:kind==='pentPyramid'?5:kind==='pentPrism'?5:6; // 依圖形種類決定底面邊數。
 const prism=kind==='pentPrism'||kind==='hexPrism',R=.72,faces=[]; // 判斷是否為柱體，並設定底面半徑和面資料陣列。
 if(prism){ // 若選到柱體，就建立柱體側面和兩個底面。
  const bottom=[],top=[]; // 建立底面和頂面的頂點陣列。
  for(let i=0;i<n;i++){let a=-HALF_PI+TWO_PI*i/n;bottom.push([R*cos(a),R*sin(a),-.5]);top.push([R*cos(a),R*sin(a),.5]);} // 計算柱體上下兩個多邊形面的頂點座標。
  const e=2*R*sin(PI/n); // 計算正多邊形邊長。
  for(let i=0;i<n;i++){let j=(i+1)%n,x=i*e;faces.push({points:[bottom[i],bottom[j],top[j],top[i]],flat:[[x,0],[x+e,0],[x+e,1],[x,1]],color:i%2?'#DCC9B4':BLUE});} // 逐一建立柱體側面及其攤平後的位置和交替顏色。
  const low=polygonFromEdge([0,0],[e,0],n,-1),lowMap=Array(n); // 建立底面展開後的多邊形頂點和索引對應陣列。
  lowMap[1]=low[0];lowMap[0]=low[1];for(let k=2;k<n;k++)lowMap[n-k+1]=low[k]; // 將底面展開頂點重新排列，對應回三維頂點順序。
  faces.push({points:bottom,flat:lowMap,color:'#E8C9C1'}); // 加入柱體底面及其展開位置。
  const high=polygonFromEdge([e,1],[0,1],n,-1),highMap=Array(n); // 建立頂面展開後的多邊形頂點和索引對應陣列。
  highMap[1]=high[0];highMap[0]=high[1];for(let k=2;k<n;k++)highMap[n-k+1]=high[k]; // 將頂面展開頂點重新排列，對應回三維頂點順序。
  faces.push({points:top,flat:highMap,color:'#A8B9A0'}); // 加入柱體頂面及其展開位置。
  return faces; // 傳回柱體所有面的資料。
 } // 結束柱體面資料的建立流程。
 const base=[],flatBase=[]; // 建立錐體底面三維座標和底面平面座標陣列。
 for(let i=0;i<n;i++){let a=-HALF_PI+TWO_PI*i/n;base.push([R*cos(a),R*sin(a),0]);flatBase.push([R*cos(a),R*sin(a)]);} // 計算錐體底面每個頂點的位置。
 const apex=[0,0,1.12];faces.push({points:base,flat:flatBase,color:'#A8B9A0'}); // 設定錐體頂點並加入底面資料。
 const e=2*R*sin(PI/n),slant=sqrt(R*R+1.12*1.12),height=sqrt(max(0,slant*slant-e*e/4)); // 計算底邊長、側棱長和展開側三角形的高度。
 for(let i=0;i<n;i++){let j=(i+1)%n,a=flatBase[i],b=flatBase[j],dx=b[0]-a[0],dy=b[1]-a[1],len=sqrt(dx*dx+dy*dy),mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];faces.push({points:[base[i],base[j],apex],flat:[a,b,[mid[0]+dy/len*height,mid[1]-dx/len*height]],color:i%2?'#8EACCA':'#E8C9C1'});} // 逐邊建立錐體側面，計算攤平後三角形頂點並交替指定顏色。
 return faces; // 傳回錐體所有面資料。
} // 結束立體面資料的建立函式。

function drawStackLearn(){drawHeader('第四階段學習：積木與三視圖',`不同積木組合 ${stackLearnPage+1}／3｜拖曳積木可自由旋轉`);panel(70,112,860,500,'#FBF8F2',22);label(`積木組合 ${stackLearnPage+1}`,500,153,24,NAVY);label('按住積木並拖曳，可從不同方向觀察堆疊。',500,188,16,'#6F776B');drawInteractiveStack(500,395,38);let names=['正視圖','側視圖','俯視圖'];for(let i=0;i<3;i++)addButton(`stackFace${i}`,225+i*185,520,165,48,names[i],()=>setStackFace(i),{fill:(i===0&&stackYaw===0&&stackPitch===STACK_HOME_PITCH)||(i===1&&stackYaw===PI/2&&stackPitch===STACK_HOME_PITCH)||(i===2&&stackPitch===0)?BLUE:'#F8F3EA'});addButton('stackResetView',415,585,170,42,'重置視角',resetStackView,{fill:'#A8B9A0'});if(stackLearnPage>0)addButton('stackPrev',190,635,170,42,'上一頁',()=>{stackLearnPage--;resetStackView();});if(stackLearnPage<2)addButton('stackNext',640,635,170,42,'下一頁',()=>{stackLearnPage++;resetStackView();});else addButton('stackFinish',570,635,240,42,'學習完成',()=>stackLearnDone=true,{fill:PINK});addButton('stackHome',40,42,112,38,'回主畫面',()=>page='stages',{fill:PINK});if(stackLearnDone)drawStackLearnDialog();} // 繪製第四階段積木模型、三視圖按鈕、重設、翻頁和完成選項。
function resetStackView(){stackYaw=STACK_HOME_YAW;stackPitch=STACK_HOME_PITCH;} // 將積木模型視角恢復為預設的水平角和俯仰角。
function setStackFace(i){if(i===0){stackYaw=0;stackPitch=STACK_HOME_PITCH;}else if(i===1){stackYaw=PI/2;stackPitch=STACK_HOME_PITCH;}else{stackYaw=0;stackPitch=0;}} // 依按鈕索引切換正視、側視或俯視角度。
function drawStackLearnDialog(){panel(245,225,510,275,'#FBF8F2',24);label('學習完成！接下來想做什麼？',500,275,24,NAVY);addButton('doneQuiz',285,335,430,48,'進入第四階段測驗',()=>{stackLearnDone=false;startGame(3,'quiz');},{fill:PINK});addButton('doneAgain',285,395,205,48,'再學習一次',()=>{stackLearnDone=false;stackLearnPage=0;resetStackView();},{fill:'#DCC9B4'});addButton('doneHome',510,395,205,48,'回主畫面',()=>{stackLearnDone=false;page='home';});} // 繪製學習完成對話框，提供進入測驗、重新學習和返回主畫面的選項。
function projectStackPoint(x,y,z,cx,cy,u){let X=x*cos(stackYaw)-y*sin(stackYaw),Y=x*sin(stackYaw)+y*cos(stackYaw),Y2=Y*cos(stackPitch)+z*sin(stackPitch),Z2=-Y*sin(stackPitch)+z*cos(stackPitch);return{x:cx+X*u,y:cy-Y2*u,z:Z2};} // 依目前積木旋轉角度將三維座標投影為畫面座標並保留深度值。
function drawInteractiveStack(cx,cy,u){const g=learningStacks[stackLearnPage],faces=[];const occ=(r,c,z)=>r>=0&&r<4&&c>=0&&c<4&&z>=0&&z<g[r][c];for(let r=0;r<4;r++)for(let c=0;c<4;c++)for(let z=0;z<g[r][c];z++){let x=c-2,y=r-2,a=[{p:[[x,y,z+1],[x+1,y,z+1],[x+1,y+1,z+1],[x,y+1,z+1]],col:'#A8B9A0',ok:()=>!occ(r,c,z+1)},{p:[[x,y,z],[x,y+1,z],[x,y+1,z+1],[x,y,z+1]],col:'#DCC9B4',ok:()=>!occ(r,c-1,z)},{p:[[x+1,y,z],[x+1,y+1,z],[x+1,y+1,z+1],[x+1,y,z+1]],col:BLUE,ok:()=>!occ(r,c+1,z)},{p:[[x,y,z],[x+1,y,z],[x+1,y,z+1],[x,y,z+1]],col:PINK,ok:()=>!occ(r-1,c,z)},{p:[[x,y+1,z],[x+1,y+1,z],[x+1,y+1,z+1],[x,y+1,z+1]],col:'#DCC9B4',ok:()=>!occ(r+1,c,z)}];for(const f of a)if(f.ok()){let pts=f.p.map(v=>projectStackPoint(...v,cx,cy,u));faces.push({pts,col:f.col,d:pts.reduce((s,p)=>s+p.z,0)/pts.length});}}faces.sort((a,b)=>a.d-b.d);for(const f of faces){fill(f.col);stroke('#6F776B');beginShape();for(const p of f.pts)vertex(p.x,p.y);endShape(CLOSE);}} // 檢查每顆積木的外露面，投影後依深度排序並繪製堆疊模型。

function drawMemory(){let cw=122,ch=92,g=14,sx=500-(cw*3+g*2)/2,sy=226;for(let i=0;i<9;i++){if(i===4)continue;let c=cards[i<4?i:i-1];if(!c)continue;let x=sx+i%3*(cw+g),y=sy+floor(i/3)*(ch+g),turn=c.up||c.matched;c.flip=lerp(c.flip,turn?1:0,.22);fill(c.matched?BLUE:turn?'#FBF8F2':'#8EACCA');stroke('#BFD4E5');rect(x,y,cw,ch,16);if(c.flip>.48){drawShape(c.shape,x+cw/2,y+42,27,'#DCC9B4');label(c.label,x+cw/2,y+ch-18,14,NAVY);}else label('？',x+cw/2,y+ch/2,35,'#FBF8F2');}if(cardMatches===4&&!feedback)setTimeout(()=>{if(page==='game'&&!feedback)answer(true,'全部配對完成！');},250);} // 繪製翻翻樂卡片、處理翻面動畫，並在全部配對後延遲顯示答對回饋。
function flipCard(i){if(cardBusy||!cards[i]||cards[i].matched||cards[i].up||feedback)return;cards[i].up=true;let a=cards.map((c,j)=>c.up&&!c.matched?j:-1).filter(j=>j>=0);if(a.length===2){cardBusy=true;if(cards[a[0]].pairKey===cards[a[1]].pairKey){cards[a[0]].matched=cards[a[1]].matched=true;cardMatches++;cardBusy=false;}else{startShake();setTimeout(()=>{cards[a[0]].up=cards[a[1]].up=false;cardBusy=false;},800);}}} // 翻開指定卡片，判斷兩張是否配對，若不相同則延遲後蓋回。
function drawMCQ(q){if(q.shape){drawShape(q.shape,500,300,62,'#DCC9B4');drawSpeakIcon(q.shapeName,566,300,19);}for(let i=0;i<q.options.length;i++){let x=140+i%2*370,y=390+floor(i/2)*90;addButton(`opt${i}`,x,y,350,66,q.options[i],()=>answer(i===q.answer,`正確答案是「${q.options[q.answer]}」。`),{fill:answered&&i===q.answer?BLUE:'#F8F3EA'});}} // 繪製選擇題的圖形、語音按鈕和選項按鈕。
function drawMatching(q){label('先點左邊圖形，再點右邊名稱',500,245,17,'#6F776B');for(let i=0;i<q.items.length;i++){let y=292+i*83;addButton(`left${i}`,190,y,210,62,'',()=>selected=i);drawShape(q.items[i][0],245,y+31,24,BLUE);label(`圖形 ${i+1}`,330,y+31,18,NAVY);let r=q.rightOrder[i];addButton(`right${i}`,600,y,210,62,r.label,()=>{if(selected<0)return;if(selected===r.itemIndex){placed.push(selected);if(placed.length===q.items.length)answer(true,q.why);else feedback='配對正確！';}else{startShake();feedback='再觀察一次圖形。'}selected=-1;});}} // 繪製左右配對列，處理左側圖形選取與右側名稱配對結果。
function drawClassify(q){label('按住圖形拖曳到正確分類框',500,240,17,'#6F776B');for(let i=0;i<q.bins.length;i++)addButton(`bin${i}`,160+i*360,502,310,85,q.bins[i],()=>{});for(let i=0;i<q.items.length;i++){if(placed.includes(i))continue;let x=dragItem===i?dragX:280+i*220,y=dragItem===i?dragY:330;panel(x-65,y-55,130,110);drawShape(q.items[i][0],x,y-6,36,BLUE);}} // 繪製分類框及尚未放置的圖形，拖曳中的圖形跟隨滑鼠位置。
function drawNetToSolid(q){drawNet(q.solid.net,285,400,43,'#DCC9B4');for(let i=0;i<4;i++){let x=625+i%2*220,y=330+floor(i/2)*145;panel(x-88,y-58,176,116,'#F8F3EA',14);drawSolid(q.choices[i].solid,x,y,62);label(q.choices[i].name,x,y+48,14,NAVY);buttons.push({x:x-88,y:y-58,w:176,h:116,action:()=>answer(i===q.answerIndex,`展開圖摺起來會形成${q.solid.name}。`)});}} // 左側繪製展開圖，右側繪製四個立體選項並記錄點擊答案。
function drawSolidToNet(q){drawSolid(q.solid.solid,285,395,86);for(let i=0;i<4;i++){let x=625+i%2*220,y=330+floor(i/2)*145;panel(x-88,y-58,176,116,'#F8F3EA',14);drawNet(q.choices[i].net,x,y,31,'#DCC9B4');buttons.push({x:x-88,y:y-58,w:176,h:116,action:()=>answer(i===q.answerIndex,`正確答案是${q.solid.name}的展開圖。`)});}} // 左側繪製立體圖形，右側繪製四個展開圖選項並記錄答案。
function drawCount(q){drawStack(q.stack.grid,500,402,45);let n=q.stack.grid.flat().reduce((a,b)=>a+b,0);for(let i=0;i<4;i++)addButton(`count${i}`,195+i*155,510,130,65,`${n+i-1} 顆`,()=>answer(n+i-1===n,q.stack.why),{size:22});} // 繪製積木堆疊、計算總顆數並建立四個數量選項。
function drawViews(q){drawStack(q.stack.grid,285,405,39);label(`指定方向：${q.view}`,285,260,21,NAVY);label('選擇相符的視圖',700,260,21,NAVY);for(let i=0;i<q.viewChoices.length;i++){let x=535+i*165,y=425,c=q.viewChoices[i];panel(x-70,y-62,140,124,'#F8F3EA',14);label(`選項 ${String.fromCharCode(65+i)}`,x,y-43,14,'#6F776B');drawViewGrid(c.data,x,y+15,13);buttons.push({x:x-70,y:y-62,w:140,h:124,action:()=>answer(i===q.answerIndex,`正確圖形是${q.view}。`)});}} // 繪製指定方向的積木模型、視圖選項及選項點擊事件。
function drawShape(k,x,y,r,col){push();translate(x,y);stroke('#6F776B');strokeWeight(2);fill(col);if(k==='tri'||k==='pent'||k==='hex'){if(k==='tri')triangle(-r,-r*.65,r,-r*.65,0,r);else polygon(0,0,r,k==='pent'?5:6);}else if(k==='tri2')triangle(-r*.9,-r*.7,r*.7,-r*.4,-r*.1,r);else if(k==='rightTri'){beginShape();vertex(-r,-r);vertex(-r,r);vertex(r,r);endShape(CLOSE);}else if(k==='square')rect(-r*.75,-r*.75,r*1.5,r*1.5);else if(k==='rect')rect(-r,-r*.55,r*2,r*1.1);else if(k==='diamond')quad(0,-r,r*.7,0,0,r,-r*.7,0);else if(k==='trap')quad(-r,-r*.55,r,-r*.55,r*.65,r*.65,-r*.65,r*.65);else if(k==='para')quad(-r*.7,-r*.6,r,-r*.6,r*.7,r*.6,-r,r*.6);else if(k==='quad')quad(-r,-r*.5,r*.65,-r,r,r*.6,-r*.3,r);else if(k==='circle')ellipse(0,0,r*1.7,r*1.7);else if(k==='cube'||k==='box'||k==='triPrism'||k==='pyramid')drawSolidLocal(k,r);pop();} // 依圖形種類繪製平面多邊形、圓形或簡化立體圖示。
function polygon(x,y,r,n){beginShape();for(let i=0;i<n;i++){let a=-HALF_PI+TWO_PI*i/n;vertex(x+cos(a)*r,y+sin(a)*r);}endShape(CLOSE);} // 依中心點、半徑和邊數建立並繪製正多邊形。
function drawSolidLocal(k,r){if(k==='pyramid'){fill(BLUE);triangle(-r*.58,r*.38,r*.58,r*.38,0,-r*.5);fill('#DCC9B4');triangle(-r*.58,r*.38,0,-r*.5,r*.82,r*.12);return;}if(k==='triPrism'){fill('#A8B9A0');triangle(-r*.5,r*.4,r*.5,r*.4,0,-r*.5);fill(BLUE);quad(-r*.5,r*.4,-r*.2,r*.2,-r*.2,-r*.7,-r*.5,-r*.5);quad(-r*.2,r*.2,r*.5,r*.4,r*.5,-r*.5,-r*.2,-r*.7);return;}fill(BLUE);rect(-r/2,-r/2,r,r);} // 繪製四角錐、三角柱或方形立體圖示的簡化局部造型。
function drawSolid(k,x,y,r){drawShape(k,x,y,r,BLUE);} // 以藍色呼叫共用圖形函式繪製指定立體圖示。
function drawNet(net,x,y,u,col){push();translate(x,y);for(const f of net.faces){fill(col);stroke('#6F776B');beginShape();for(const p of f.p)vertex(p[0]*u,p[1]*u);endShape(CLOSE);}pop();} // 將展開圖各面的座標按比例縮放後逐面繪製。
function drawStack(g,x,y,u){let rows=g.length,cols=g[0].length,bh=u*.68;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)for(let z=0;z<g[r][c];z++){let xx=x+(c-(cols-1)/2)*u*.5-(r-(rows-1)/2)*u*.5,yy=y+((c-(cols-1)/2)+(r-(rows-1)/2))*u*.25-z*bh;drawIsoCube(xx,yy,u,u*.25,bh,true,true,z===g[r][c]-1);}} // 逐格讀取積木高度，計算等角投影位置並繪製每顆立方體。
function drawIsoCube(x,y,w,v,h,l,r,t){let top={x,y:y-v},right={x:x+w/2,y},bottom={x,y:y+v},left={x:x-w/2,y};stroke('#6F776B');if(l){fill('#DCC9B4');quad(left.x,left.y,bottom.x,bottom.y,bottom.x,bottom.y+h,left.x,left.y+h);}if(r){fill(BLUE);quad(right.x,right.y,bottom.x,bottom.y,bottom.x,bottom.y+h,right.x,right.y+h);}if(t){fill('#A8B9A0');quad(top.x,top.y,right.x,right.y,bottom.x,bottom.y,left.x,left.y);}} // 計算立方體各面的等角投影頂點，依條件繪製左側、右側和頂面。
function viewHeights(g,v){if(v==='正視圖')return Array.from({length:g[0].length},(_,c)=>Math.max(...g.map(r=>r[c])));if(v==='側視圖')return g.map(r=>Math.max(...r)).reverse();return g.flat().map(x=>x?1:0);} // 依正視、側視或俯視方向，從積木高度資料計算投影高度或占位格。
function drawViewGrid(d,x,y,u){if(Array.isArray(d[0])){let rows=d.length,cols=d[0].length;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){fill(d[r][c]?'#A8B9A0':'#FBF8F2');stroke('#6F776B');rect(x-cols*u/2+c*u,y-rows*u/2+r*u,u,u);}}else{let m=max(...d);for(let c=0;c<d.length;c++)for(let h=0;h<d[c];h++){fill('#DCC9B4');stroke('#6F776B');rect(x-d.length*u/2+c*u,y+m*u/2-(h+1)*u,u,u);}}} // 依資料是格狀俯視圖或高度列圖，繪製對應的方格視圖。

function mousePressed(){handlePress(mouseX,mouseY);} // 滑鼠按下時，將目前座標交給共用點擊處理函式。
function touchStarted(){handlePress(mouseX,mouseY);return false;} // 觸控開始時使用相同的點擊處理，並阻止瀏覽器預設觸控行為。
function handlePress(px,py){let x=ptX(px),y=ptY(py);if(page==='solidLearn'&&solidLearnPage==='model'&&netProgress<.01&&x>250&&x<750&&y>220&&y<520){solidDrag=true;solidLastX=x;solidLastY=y;return;}if(page==='stackLearn'&&!stackLearnDone&&x>185&&x<815&&y>210&&y<505){stackDrag=true;stackLastX=x;stackLastY=y;return;}for(let i=voiceButtons.length-1;i>=0;i--)if(inRect(x,y,voiceButtons[i])){voiceButtons[i].action();return;}if(page==='game'&&questions[qIndex]?.type==='memory'&&!feedback){let cw=122,ch=92,g=14,sx=500-(cw*3+g*2)/2,sy=226;for(let i=0;i<9;i++){if(i===4)continue;let ci=i<4?i:i-1,b={x:sx+i%3*(cw+g),y:sy+floor(i/3)*(ch+g),w:cw,h:ch};if(inRect(x,y,b)){flipCard(ci);return;}}}if(page==='game'&&questions[qIndex]?.type==='classify'&&dragItem<0){for(let i=0;i<3;i++){let xx=280+i*220;if(dist(x,y,xx,330)<75){dragItem=i;dragX=x;dragY=y;return;}}}for(let i=buttons.length-1;i>=0;i--)if(inRect(x,y,buttons[i])){buttons[i].action();playTone(true);return;}} // 將滑鼠座標換算為遊戲座標，依序處理模型拖曳、語音、翻牌、分類拖曳和按鈕點擊。
function mouseDragged(){if(solidDrag){let x=ptX(mouseX),y=ptY(mouseY);solidYaw+=(x-solidLastX)*.012;solidPitch+=(y-solidLastY)*.012;solidLastX=x;solidLastY=y;return;}if(stackDrag){let x=ptX(mouseX),y=ptY(mouseY);stackYaw+=(x-stackLastX)*.012;stackPitch+=(y-stackLastY)*.012;stackLastX=x;stackLastY=y;return;}if(dragItem>=0){dragX=ptX(mouseX);dragY=ptY(mouseY);}} // 拖曳時更新立體或積木的旋轉角度，或更新正在分類的圖形位置。
function touchMoved(){if(solidDrag||stackDrag){mouseDragged();return false;}if(dragItem>=0){dragX=ptX(mouseX);dragY=ptY(mouseY);}return false;} // 觸控移動時重用滑鼠拖曳邏輯，並更新分類圖形位置。
function mouseReleased(){solidDrag=false;stackDrag=false;finishDrag(ptX(mouseX),ptY(mouseY));} // 滑鼠放開時結束模型拖曳，並檢查分類圖形是否放入正確區域。
function touchEnded(){solidDrag=false;stackDrag=false;finishDrag(ptX(mouseX),ptY(mouseY));return false;} // 觸控結束時結束拖曳並檢查分類結果。
function finishDrag(x,y){if(dragItem<0)return;let i=dragItem,q=questions[qIndex],hit=-1;for(let b=0;b<q.bins.length;b++)if(inRect(x,y,{x:160+b*360,y:502,w:310,h:85}))hit=b;if(hit>=0&&q.bins[hit]===q.items[i][1]){placed.push(i);if(placed.length===q.items.length)answer(true,'分類完成！');}else{startShake();feedback='分類不正確，圖形回到原位。';}dragItem=-1;} // 判斷拖曳項目落在哪個分類框，更新完成狀態或顯示錯誤回饋。
function startShake(){shakeUntil=millis()+420;} // 設定震動效果的結束時間。
function burstConfetti(){for(let i=0;i<75;i++)confetti.push({x:random(150,850),y:random(180,360),vx:random(-4,4),vy:random(-7,-2),g:random(.12,.24),life:random(55,95),size:random(5,10),color:random([BLUE,PINK,'#A8B9A0'])});} // 產生多個具有不同位置、速度、重力、生命週期和顏色的紙花粒子。
function drawConfetti(){for(let i=confetti.length-1;i>=0;i--){let p=confetti[i];p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life--;noStroke();fill(p.color);rect(p.x,p.y,p.size,p.size*1.7,2);if(p.life<=0||p.y>BASE_H)confetti.splice(i,1);}} // 更新並繪製紙花粒子，並移除已消失或掉出畫面的粒子。
function answer(ok,why){if(answered)return;answered=true;feedback=ok?'答對了！':'再試著理解一下。';explanation=why||'';if(ok){score++;burstConfetti();}else startShake();} // 記錄作答結果，設定回饋和解說，答對加分並放紙花，答錯則震動畫面。
function advance(){if(mode==='learn'){page='stages';return;}if(qIndex<questions.length-1){qIndex++;resetQuestion();}else page='result';} // 學習模式返回階段選單；測驗模式前往下一題或結果頁。
function shuffle(a){let b=[...a];for(let i=b.length-1;i>0;i--){let j=floor(random(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;} // 使用 Fisher–Yates 演算法建立並回傳隨機打亂的新陣列。
function playTone(ok){if(!soundOn)return;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();let o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=ok?660:220;g.gain.setValueAtTime(.07,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.18);o.start();o.stop(audioCtx.currentTime+.18);}catch(e){}} // 音效開啟時建立振盪器，依答題狀態播放不同音高的短音。
function drawResult(){drawHeader('階段完成！','每一次觀察都讓空間感更進步');panel(125,145,750,440,'#FBF8F2',28);label(mode==='mixed'?'綜合測驗':stageNames[stage],500,220,29,NAVY);label(`答對 ${score}／${questions.length} 題`,500,315,38,BLUE);addButton('again',155,475,205,65,'再挑戰一次',()=>startGame(stage,mode),{fill:PINK});addButton('learnAgain',398,475,205,65,'學習一次',()=>startGame(stage,'learn'),{fill:'#A8B9A0'});addButton('stages',640,475,205,65,'回階段選單',()=>page='stages',{fill:'#DCC9B4'});} // 繪製測驗結果、答對題數，以及重新挑戰、再次學習和返回階段選單按鈕。
function drawExitDialog(){panel(280,270,440,190,'#FBF8F2',24);label('要離開這次挑戰嗎？',500,315,25,NAVY);addButton('cancelExit',330,385,145,52,'繼續遊戲',()=>confirmExit=false,{fill:PINK});addButton('confirmExit',525,385,145,52,'離開',()=>{confirmExit=false;page='stages';},{fill:PINK});} // 繪製退出確認對話框，提供繼續遊戲或離開並返回階段選單的選項。