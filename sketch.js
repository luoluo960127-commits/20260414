// 定義關卡資料
let levels = [
  { x: 0.15, y: 0.20, label: "0224 練習", url: "https://luoluo960127-commits.github.io/20260224/", desc: "初探 p5.js：基礎圖形繪製與座標系統" },
  { x: 0.45, y: 0.25, label: "0303 練習", url: "https://luoluo960127-commits.github.io/0303-/", desc: "動態控制：變數與滑鼠事件的基礎應用" },
  { x: 0.75, y: 0.20, label: "0310 練習", url: "https://luoluo960127-commits.github.io/20260310/", desc: "重複美學：巢狀迴圈與圖形排列設計" },
  { x: 0.85, y: 0.45, label: "0317 練習", url: "https://luoluo960127-commits.github.io/20260321/", desc: "視覺互動：動態色彩與滑鼠軌跡特效" },
  { x: 0.55, y: 0.65, label: "0324 練習", url: "https://luoluo960127-commits.github.io/0324/", desc: "邏輯架構：函式封裝與陣列資料管理" },
  { x: 0.12, y: 0.50, label: "0407 練習", url: "https://luoluo960127-commits.github.io/20260407-/", desc: "進階動態：物件導向程式設計初體驗" },
  { x: 0.20, y: 0.75, label: "0414練習", url: "https://luoluo960127-commits.github.io/20260407/", desc: "期中專案：互動視覺作品整合展示" },
  { x: 0.45, y: 0.85, label: "0422 練習", url: "https://luoluo960127-commits.github.io/0422/", desc: "擴充實作：全新網頁架構與外部連結整合" }
];

// 遊戲物件、狀態與全局變數
let iframe, bgMusic, houseSfx;
let trees = [], clouds = [], flowers = [], rocks = [], bushes = [], particles = [], butterflies = [];
let rainDrops = [];
let wind = 0;
let player = {
  currentX: 0.15, currentY: 0.2, 
  targetX: 0.15, targetY: 0.2,
  moving: false,
  idleTimer: 0,
  facingLeft: false,
  targetUrl: null,
  speed: 0.03 
};
let weather = "day"; // day, night, rain

// Colors for retro feel
const COLOR_GRASS_BASE = [110, 190, 115]; // 調亮基礎色
const COLOR_GRASS_DARK = [90, 165, 95];   // 縮小與基色的差距，減少雜訊感
const COLOR_PATH = [210, 180, 140];
const COLOR_HOUSE_BODY = [161, 130, 119];
const COLOR_HOUSE_ROOF = [191, 67, 67];
const COLOR_HOUSE_DOOR = [82, 59, 55];
const COLOR_CLOUD = [255, 255, 255, 200];
const COLOR_ALPACA_BODY = [240, 240, 240];
const COLOR_ALPACA_EYE = [50];
const COLOR_WATER = [129, 212, 250, 180];
const COLOR_TREE_TRUNK = [93, 64, 55];
const COLOR_TREE_LEAVES = [46, 125, 50];
const COLOR_SHADOW = [0, 0, 0, 60];
const COLOR_TOOLTIP_BG = [0, 0, 0, 200];
const COLOR_TOOLTIP_TEXT = [255];
const COLOR_VIGNETTE = [0, 0, 0, 50];
const COLOR_WINDOW_GLOW = [255, 235, 59, 150];
const COLOR_HILL_LIGHT = [100, 160, 100];
const COLOR_HILL_DARK = [80, 130, 80];

// 蝴蝶類別：增加地圖生動感
class Butterfly {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.angle = random(TWO_PI);
    this.v = random(0.5, 1.5);
    this.size = random(4, 7);
    this.c = color(255, random(150, 255), random(150, 255), 200);
  }
  update() {
    this.pos.x += cos(this.angle) * this.v;
    this.pos.y += sin(this.angle) * this.v;
    this.angle += random(-0.15, 0.15);
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
  }
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    let wing = sin(frameCount * 0.4) * this.size;
    fill(this.c);
    noStroke();
    ellipse(-wing/2, 0, this.size, this.size*1.5);
    ellipse(wing/2, 0, this.size, this.size*1.5);
    pop();
  }
}

function preload() {
  // 背景音樂為 wav 格式
  bgMusic = loadSound('期中音樂.wav', 
    () => console.log("音樂載入成功"), 
    (err) => console.error("音樂載入失敗，請檢查檔名或路徑:", err)
  );

  // 開啟房子的音效為 mp3 格式
  houseSfx = loadSound('期中音效.mp3',
    () => console.log("音效載入成功"),
    (err) => console.error("音效載入失敗，請檢查檔名是否正確:", err)
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  imageMode(CENTER);

  // 建立環境裝飾物件
  for(let i=0; i<15; i++) trees.push({x: random(1), y: random(1), s: random(0.8, 1.2)});
  for(let i=0; i<8; i++) clouds.push({x: random(1), y: random(0.1, 0.4), s: random(60, 100), speed: random(0.001, 0.003)});
  for(let i=0; i<30; i++) flowers.push({x: random(1), y: random(1), c: color(random(200,255), random(100,200), random(100,200))});
  for(let i=0; i<20; i++) rocks.push({x: random(1), y: random(1), s: random(0.5, 1.5)});
  for(let i=0; i<25; i++) bushes.push({x: random(1), y: random(1), s: random(0.8, 1.4)});
  for(let i=0; i<50; i++) particles.push({x: random(1), y: random(1), size: random(1, 3), alpha: random(50, 150), offset: random(1000)});
  for(let i=0; i<10; i++) butterflies.push(new Butterfly());
  
  // 預先建立雨滴粒子
  for(let i=0; i<150; i++) {
    rainDrops.push({ x: random(width), y: random(height), speed: random(8, 15), len: random(10, 20) });
  }

  // 提供給外部 HTML（選單）使用的速度調整介面
  window.setPlayerSpeed = (val) => {
    player.speed = parseFloat(val);
  };

  // 提供給外部 HTML（選單）使用的音量調整介面
  window.setVolume = (val) => {
    if (bgMusic) bgMusic.setVolume(val / 100);
  };

  window.setWeather = (val) => {
    weather = val;
  };

  // 提供給選單直接跳轉關卡的功能
  window.navigateToLevel = (index) => {
    let lvl = levels[index];
    if (lvl && iframe) {
      player.currentX = lvl.x;
      player.currentY = lvl.y;
      player.targetX = lvl.x;
      player.targetY = lvl.y;
      player.moving = false;
      iframe.attribute('src', lvl.url);
      iframe.show();
      if (houseSfx && houseSfx.isLoaded()) houseSfx.play();
    }
  };

  // 初始化網頁框架
  if (iframe) iframe.remove();
  iframe = createElement('iframe');
  iframe.style('width', '80%');
  iframe.style('height', '80%');
  iframe.style('position', 'fixed');
  iframe.style('top', '10%');
  iframe.style('left', '10%');
  iframe.style('border', 'none');
  iframe.style('border-radius', '10px');
  iframe.style('box-shadow', '0 0 20px rgba(0,0,0,0.5)');
  iframe.style('z-index', '1000');
  iframe.hide();
}

function draw() {
  // 更新全局物理模擬
  wind = sin(frameCount * 0.02) * 2;

  drawPixelGrass(); 
  
  drawWater();
  drawEnvironment(); 
  drawPath();
  drawLevels();
  drawClouds(); 
  drawParticles();
  drawButterflies();
  updateAndDrawPlayer();
  drawUIOverlay();
  drawWeatherEffects();
}

function drawPixelGrass() {
  noStroke(); // 確保沒有邊框
  background(COLOR_GRASS_BASE);
  let pixelSize = 50; // 增大像素塊，讓畫面看起來更乾淨不雜亂
  for (let x = 0; x < width; x += pixelSize) {
    for (let y = 0; y < height; y += pixelSize) {
      // 降低噪點頻率，讓草地色塊更大片、更平滑
      let n = noise(x * 0.002, y * 0.002);
      fill(n > 0.6 ? COLOR_GRASS_DARK : COLOR_GRASS_BASE);
      rect(x, y, pixelSize, pixelSize);
    }
  }
  // 移除了細小的隨機草點和三角形，減少「雜訊感」
}

function drawHills() {
  noStroke();
  for(let h of hills) {
    fill(h.c);
    // 簡單的像素山丘形狀
    beginShape();
    vertex(h.x - h.w/2, h.y);
    vertex(h.x - h.w/4, h.y - h.h/2);
    vertex(h.x, h.y - h.h);
    vertex(h.x + h.w/4, h.y - h.h/2);
    vertex(h.x + h.w/2, h.y);
    endShape(CLOSE);
  }
}

function drawWater() {
  push();
  let wx = width * 0.32, wy = height * 0.48;
  
  // 湖泊岸邊/深色水底 (增加層次感)
  noStroke();
  fill(70, 130, 180, 200); 
  ellipse(wx, wy, 210, 130); 

  // 湖泊主體
  fill(COLOR_WATER);
  noStroke();
  ellipse(wx, wy, 180, 110);

  // 動態波紋
  noFill();
  for(let i=0; i<3; i++) {
    let r = (frameCount * 0.4 + i * 40) % 120;
    let alpha = map(r, 0, 120, 150, 0);
    stroke(255, alpha);
    strokeWeight(1.5);
    ellipse(wx, wy, r * 1.5, r * 0.9);
  }
  
  // 水面高光反光
  noStroke();
  fill(255, 255, 255, 80);
  ellipse(wx - 30, wy - 20, 50, 15);
  pop();
}

function drawEnvironment() {
  // 繪製灌木 (受風力影響)
  for(let b of bushes) {
    push(); // 保存當前繪圖狀態
    translate(b.x * width + wind * 0.5, b.y * height); // 灌木受風輕微擺動
    fill(36, 115, 40, 180); // 更深的綠
    ellipse(0, 0, 35 * b.s, 25 * b.s); // 更大更圓潤
    pop(); // 恢復繪圖狀態
  }

  for(let r of rocks) {
    fill(130, 120, 110); // 淺灰色岩石
    ellipse(r.x * width, r.y * height, 20 * r.s, 12 * r.s);
  }

  for(let f of flowers) {
    push();
    translate(f.x * width + wind * 0.2, f.y * height); // 花朵隨風擺動並輕微水平移動
    rotate(wind * 0.05); // 花朵隨風擺動
    fill(f.c); ellipse(0, -3, 8, 8); // 更大的花瓣
    fill(255, 235, 59);
    ellipse(0, 0, 3, 3);
    pop();
  }
  
  for(let t of trees) {
    push();
    translate(t.x * width, t.y * height);
    scale(t.s);
    shearX(wind * 0.01); // 樹木整體傾斜
    fill(COLOR_TREE_TRUNK); rect(-4, 0, 8, 12);
    fill(lerpColor(color(COLOR_TREE_LEAVES), color(COLOR_TREE_LEAVES[0] - 20, COLOR_TREE_LEAVES[1] - 20, COLOR_TREE_LEAVES[2] - 20), noise(t.x * 0.5))); // 樹葉顏色深淺變化
    triangle(-20, 0, 20, 0, 0, -30);
    triangle(-16, -15, 16, -15, 0, -45);
    pop();
  }
}

function drawClouds() {
  noStroke();
  for(let c of clouds) { 
    fill(255, 100); // 大幅降低透明度，讓雲朵變柔和
    c.x += c.speed;
    if(c.x > 1.1) c.x = -0.1;
    let cx = c.x * width;
    let cy = c.y * height;
    
    // 使用多個橢圓組合出精緻的蓬鬆雲朵形狀
    ellipse(cx, cy, c.s, c.s * 0.5);
    ellipse(cx + c.s * 0.3, cy - c.s * 0.1, c.s * 0.6, c.s * 0.6);
    ellipse(cx - c.s * 0.2, cy + c.s * 0.05, c.s * 0.5, c.s * 0.4);
    ellipse(cx + c.s * 0.5, cy + c.s * 0.1, c.s * 0.4, c.s * 0.3);
  }
}

function drawButterflies() {
  for (let b of butterflies) {
    b.update();
    b.display();
  }
}

function drawParticles() {
  // 粒子大小和透明度隨機變化
  for(let p of particles) {
    let pAlpha = p.alpha + sin(frameCount * 0.1 + p.offset) * 50;
    if (weather === 'night') fill(180, 255, 100, pAlpha + 100); // 晚上變成綠色螢火蟲
    else fill(255, 255, 200, pAlpha);
    let px = (p.x * width + sin(frameCount * 0.01 + p.offset) * 50);
    let py = (p.y * height + cos(frameCount * 0.01 + p.offset) * 50);
    ellipse(px, py, p.size + sin(frameCount * 0.05 + p.offset) * 1, p.size + cos(frameCount * 0.05 + p.offset) * 1);
  }
}

function drawPath() {
  stroke(COLOR_PATH); // 路徑顏色
  strokeWeight(16); // 增加路徑粗細
  strokeJoin(ROUND);
  drawingContext.setLineDash([15, 15]);
  noFill();
  beginShape();
  let start = levels[0];
  curveVertex(start.x * width, start.y * height);
  for (let l of levels) curveVertex(l.x * width, l.y * height);
  let end = levels[levels.length - 1];
  curveVertex(end.x * width, end.y * height);
  endShape();
  drawingContext.setLineDash([]);
  noStroke();
}

function updateAndDrawPlayer() {
  let dx = player.targetX - player.currentX;
  let dy = player.targetY - player.currentY;
  
  if (abs(dx) > 0.001) player.facingLeft = dx < 0; // 根據移動方向調整朝向

  if (abs(dx) > 0.001 || abs(dy) > 0.001) {
    player.currentX += dx * player.speed;
    player.currentY += dy * player.speed;
    player.moving = true;
    // 增加移動時的動畫速度
    player.idleTimer = 0;
  } else if (player.moving) {
    player.moving = false;
    if (player.targetUrl) {
      iframe.attribute('src', player.targetUrl);
      iframe.show();
        if (houseSfx && houseSfx.isLoaded()) houseSfx.play();
    }
  }

  push();
  let px = player.currentX * width;
  let py = player.currentY * height;
  translate(px, py);
  if (player.facingLeft) scale(-1, 1);
  
  let bounce = player.moving ? sin(frameCount * 0.2) * 5 : 0;
  let breathe = sin(frameCount * 0.05) * 1.5;
  translate(0, bounce);

  // 精緻陰影
  fill(COLOR_SHADOW); 
  ellipse(0, 18, 45 + breathe, 12);

  fill(COLOR_ALPACA_BODY);
  rectMode(CENTER);
  rect(0, breathe, 40, 30 + breathe, 15); // Body (breathe effect)
  // Neck with "fluff"
  rect(-15, -15, 16, 30, 12); 
  rect(-18, -32, 22, 16, 8); // Head
  // Ears
  triangle(-24, -38, -20, -45, -16, -38);
  triangle(-12, -38, -8, -45, -4, -38);
  // Tail
  ellipse(20, 0, 10, 10);
  
  // 眼睛與眨眼效果
  fill(COLOR_ALPACA_EYE);
  let eyeH = (frameCount % 100 < 5) ? 1 : 4; 
  ellipse(-22, -32, 3, eyeH);
  
  fill(COLOR_ALPACA_BODY);
  let walk = player.moving ? cos(frameCount * 0.2) * 10 : 0;
  rect(-10, 15 + walk, 7, 12, 3);
  rect(10, 15 - walk, 7, 12, 3);
  pop();
}

function drawLevels() {
  let hoveredAny = false;
  for (let i = 0; i < levels.length; i++) {
    let lvl = levels[i];
    let px = lvl.x * width;
    let py = lvl.y * height;
    
    let d = dist(mouseX, mouseY, px, py);
    let isHovered = d < 45; // 再調小一點判定範圍
    if (isHovered) hoveredAny = true;
    
    let s = isHovered ? 2.1 : 1.8; // 從 2.0/2.3 縮小至 1.8/2.1
    let hoverFloat = isHovered ? sin(frameCount * 0.1) * 3 : 0;
    let pulseScale = 1;
    if (i === 0 && !player.moving) { // 如果是第一個關卡且玩家未移動，則添加脈動效果
      pulseScale = 1 + sin(frameCount * 0.08) * 0.05;
    }

    push();
    translate(px, py + hoverFloat);
    scale(s * pulseScale); // 應用脈動縮放


    fill(COLOR_SHADOW); ellipse(0, 22 - hoverFloat, 60, 15); // 房子陰影

    // Smoke particles
    let smokeY = (frameCount * 1.5) % 50;
    fill(255, 255, 255, 150 - smokeY * 3);
    ellipse(18 + wind * 0.5, -45 - smokeY, 8 + smokeY/5, 6 + smokeY/8);

    fill(COLOR_HOUSE_BODY); 
    rectMode(CENTER);
    rect(0, 0, 48, 42, 5); // House
    triangle(-30, -15, 30, -15, 0, -50); 
    
    // 屋頂紋理
    fill(COLOR_HOUSE_ROOF[0] - 20, COLOR_HOUSE_ROOF[1] - 20, COLOR_HOUSE_ROOF[2] - 20, 100);
    beginShape();
    vertex(-30, -15);
    vertex(0, -50);
    vertex(0, -15);
    endShape(CLOSE);

    // 門與窗戶細節
    fill(COLOR_HOUSE_DOOR); rect(0, 12, 16, 18, 2); // 門
    fill(COLOR_HOUSE_DOOR[0] + 20, COLOR_HOUSE_DOOR[1] + 20, COLOR_HOUSE_DOOR[2] + 20);
    rect(0, 12, 4, 8); // 門把手

    // 窗戶閃爍燈光
    let flicker = noise(frameCount * 0.1) * 60;
    if (weather === 'night') {
      // 增加窗戶向外擴散的光暈 (Glow/Bloom)
      for (let g = 4; g > 0; g--) {
        fill(255, 235, 59, 12 - g * 2); 
        rect(-14, 0, 12 + g * 12, 12 + g * 12, 8);
      }
    }
    
    let glowBase = (weather === 'night') ? 230 : 150; 
    fill(255, 245, 150, glowBase + flicker);
    rect(-14, 0, 12, 12, 2);
    fill(20, 20, 20, 100); // 窗框
    rect(-14, 0, 1, 12); rect(-14, 0, 12, 1);

    fill(255);
    textSize(12);
    text(i + 1, 0, 12);
    pop();
    
    if (i === 0 && !player.moving && iframe.style('display') === 'none') {
      push();
      fill(255);
      textSize(18);
      textStyle(BOLD);
      text("點擊這裡開始冒險", px, py + 60);
      pop();
    }

    if (isHovered) drawTooltip(lvl);
  }

  cursor(hoveredAny ? HAND : ARROW);
}

function drawUIOverlay() { // 移除黑色雜訊（暈影）

  if (iframe && iframe.style('display') !== 'none') {
    fill(0, 180);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, width, height);
    fill(255);
    textSize(20);
    text("點擊空白處返回地圖", width/2, height * 0.95);
  }
}

function drawWeatherEffects() {
  if (weather === "night") {
    // 晚上：調亮遮罩並微調色調為較清爽的深藍色
    fill(15, 25, 55, 110); 
    rectMode(CORNER);
    rect(0, 0, width, height);

  } else if (weather === "rain") {
    // 下雨：灰色遮罩 + 雨滴
    fill(100, 110, 130, 80);
    rectMode(CORNER);
    rect(0, 0, width, height);
    
    stroke(200, 200, 250, 150);
    strokeWeight(1.5);
    for (let d of rainDrops) {
      line(d.x, d.y, d.x - 2, d.y + d.len);
      d.y += d.speed;
      d.x -= 1; // 雨滴隨風稍微傾斜
      if (d.y > height) {
        d.y = -20;
        d.x = random(width + 100);
      }
    }
    noStroke();
  }
  // 白天則不加額外特效
}

function mousePressed() {
  // 處理瀏覽器音訊啟動策略
  if (getAudioContext().state !== 'running') {
    userStartAudio();
  }
  
  // 確保音樂載入成功後才播放
  if (bgMusic && bgMusic.isLoaded() && !bgMusic.isPlaying()) {
    bgMusic.setVolume(0.5);
    bgMusic.loop();
  }

  if (iframe && iframe.style('display') !== 'none') {
    iframe.attribute('src', ''); // 清空網址停止聲音
    iframe.hide();
    player.targetUrl = null;
    return;
  }

  let hitAny = false;
  for (let lvl of levels) {
    let px = lvl.x * width;
    let py = lvl.y * height;
    let d = dist(mouseX, mouseY, px, py);
    if (d < 55) { // 縮小點擊判定範圍以符合新尺寸
      // 如果點擊的是目前的關卡（就在腳下），立刻開啟
      if (dist(player.currentX, player.currentY, lvl.x, lvl.y) < 0.01) {
        if (iframe) {
          iframe.attribute('src', lvl.url);
          iframe.show();
          if (houseSfx && houseSfx.isLoaded()) houseSfx.play();
        }
      } else {
        player.targetX = lvl.x;
        player.targetY = lvl.y;
        player.targetUrl = lvl.url;
      }
      break;
    }
  }
}

// 繪製資訊提示框
function drawTooltip(lvl) {
  push();
  // RPG Style dialog box (更精緻的圓角和漸層)
  stroke(255, 255, 255, 200); // 白色邊框
  strokeWeight(3);
  let gradient = drawingContext.createLinearGradient(mouseX, mouseY - 60, mouseX, mouseY + 10);
  gradient.addColorStop(0, 'rgba(40, 50, 80, 0.95)'); // 頂部深藍
  gradient.addColorStop(1, 'rgba(20, 25, 40, 0.98)'); // 底部更深藍
  drawingContext.fillStyle = gradient;
  rectMode(CORNER);
  rect(mouseX + 15, mouseY - 60, 200, 80, 10); // 圓角對話框
  noStroke();

  fill(255);
  textSize(14); // Larger text
  textStyle(BOLD); textSize(15);
  text(lvl.label, mouseX + 115, mouseY - 35);
  textStyle(NORMAL);
  textSize(13); fill(220);
  text(lvl.desc, mouseX + 115, mouseY - 10);
  pop();
}
