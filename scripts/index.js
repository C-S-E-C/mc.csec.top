// 全局变量
let canvas1, canvas2, ctx1, ctx2;
let images = [];
let currentImageIndex = 0;
let nextImageIndex = 0;
let slideshowInterval = null;
let slideshowSpeed = 3000;
let isTransitioning = false;

// 预加载图片
function preloadImages() {
    showLoader();
    const imagePromises = [];
    
    for (let i = 0; i <= 4; i++) {
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.src = `https://assets.r2.csec.top/mc.csec.top/background.${i}.webp`;
            img.onload = () => {
                console.log(`图片 ${i} 预加载成功`);
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`图片 ${i} 加载失败，使用备用图片`);
                resolve(createFallbackImage(i));
            };
        });
        imagePromises.push(promise);
    }
    
    Promise.all(imagePromises).then(loadedImages => {
        images = loadedImages;
        hideLoader();
        init();
    }).catch(error => {
        console.error('图片加载失败:', error);
        hideLoader();
    });
}

// 创建备用图片
function createFallbackImage(index) {
    const canvas = document.createElement('canvas');
    canvas.width = document.documentElement.scrollWidth;
    canvas.height = document.documentElement.scrollHeight;
    const ctx = canvas.getContext('2d');
    
    // 创建纯色背景
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加文字
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`图片 ${index}`, canvas.width / 2, canvas.height / 2 - 50);
    
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
}

// 显示加载器
function showLoader() {
    document.getElementById('loader').style.display = 'block';
}

// 隐藏加载器
function hideLoader() {
    document.getElementById('loader').style.display = 'none';
}

// 初始化函数
function init() {
    if (images.length === 0) return;
    
    // 获取canvas元素
    canvas1 = document.getElementById("gallery");
    canvas2 = document.getElementById("gallery2");
    
    // 设置canvas尺寸
    canvas1.width = window.innerWidth;
    canvas1.height = window.innerHeight;
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    
    // 获取2D上下文
    ctx1 = canvas1.getContext("2d");
    ctx2 = canvas2.getContext("2d");
    
    // 启用高质量图像平滑
    enableHighQualityRendering(ctx1);
    enableHighQualityRendering(ctx2);
    
    // 绘制第一张图片（完全填充）
    drawImageToCanvas(ctx1, images[0], true);
    
    // 启动自动播放
    startSlideshow();
    
    // 添加窗口大小调整监听
    window.addEventListener('resize', handleResize);
}

// 启用高质量渲染
function enableHighQualityRendering(context) {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.webkitImageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;
    context.msImageSmoothingEnabled = true;
    context.oImageSmoothingEnabled = true;
}

// 绘制图片到指定canvas - 修复黑边问题
function drawImageToCanvas(context, img, fillMode = true) {
    const canvas = context.canvas;
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (fillMode) {
        // 填充模式：完全填充画布，可能会裁剪部分图片
        if (imgRatio > canvasRatio) {
            // 图片更宽，按高度填充
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            // 图片更高，按宽度填充
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        }
    } else {
        // 适应模式：完整显示图片，可能会有黑边
        if (imgRatio > canvasRatio) {
            // 图片更宽，按宽度适应
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            // 图片更高，按高度适应
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgRatio;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
        }
    }
    
    // 清除并绘制
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // 如果需要，可以先填充黑色背景
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

// 平滑切换图片
function transitionToNextImage() {
    if (isTransitioning || images.length === 0) return;
    
    isTransitioning = true;
    nextImageIndex = (currentImageIndex + 1) % images.length;
    
    // 在第二个canvas上绘制下一张图片
    drawImageToCanvas(ctx2, images[nextImageIndex], true);
    
    // 淡入淡出动画
    let opacity = 0;
    canvas2.style.opacity = opacity;
    
    const fadeIn = () => {
        opacity += 0.02;
        canvas2.style.opacity = opacity;
        
        if (opacity < 1) {
            requestAnimationFrame(fadeIn);
        } else {
            // 动画完成
            [canvas1, canvas2] = [canvas2, canvas1];
            [ctx1, ctx2] = [ctx2, ctx1];
            
            canvas2.style.opacity = 0;
            currentImageIndex = nextImageIndex;
            isTransitioning = false;
        }
    };
    
    requestAnimationFrame(fadeIn);
}

// 下一张图片
function nextImage() {
    if (isTransitioning) return;
    transitionToNextImage();
}

// 上一张图片
function prevImage() {
    if (isTransitioning || images.length === 0) return;
    
    isTransitioning = true;
    nextImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    
    // 在第二个canvas上绘制上一张图片
    drawImageToCanvas(ctx2, images[nextImageIndex], true);
    
    // 淡入淡出动画
    let opacity = 0;
    canvas2.style.opacity = opacity;
    
    const fadeIn = () => {
        opacity += 0.02;
        canvas2.style.opacity = opacity;
        
        if (opacity < 1) {
            requestAnimationFrame(fadeIn);
        } else {
            // 动画完成
            [canvas1, canvas2] = [canvas2, canvas1];
            [ctx1, ctx2] = [ctx2, ctx1];
            
            canvas2.style.opacity = 0;
            currentImageIndex = nextImageIndex;
            isTransitioning = false;
        }
    };
    
    requestAnimationFrame(fadeIn);
}

// 开始自动播放
function startSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
    }
    slideshowInterval = setInterval(() => {
        if (!isTransitioning) {
            transitionToNextImage();
        }
    }, slideshowSpeed);
}

// 暂停/继续自动播放
function toggleSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    } else {
        startSlideshow();
    }
}

// 处理窗口大小调整
function handleResize() {
    if (!canvas1 || !images.length) return;
    
    canvas1.width = window.innerWidth;
    canvas1.height = window.innerHeight;
    canvas2.width = window.innerWidth;
    canvas2.height = window.innerHeight;
    
    // 重新绘制当前图片
    drawImageToCanvas(ctx1, images[currentImageIndex], true);
    
    // 如果正在过渡，也重新绘制下一张图片
    if (isTransitioning) {
        drawImageToCanvas(ctx2, images[nextImageIndex], true);
    }
    
    // 重置图像平滑
    enableHighQualityRendering(ctx1);
    enableHighQualityRendering(ctx2);
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM已加载，预加载图片...");
    preloadImages();
    loadsplashtext();
});

// 键盘控制
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            prevImage();
            break;
        case 'ArrowRight':
            nextImage();
            break;
        case ' ':
            e.preventDefault();
            toggleSlideshow();
            break;
        case 'f':
        case 'F':
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.documentElement.requestFullscreen();
            }
            break;
    }
});

// 添加触摸滑动支持
let touchStartX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

document.addEventListener('touchend', (e) => {
    if (isTransitioning) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - touchStartX;
    
    // 滑动距离超过50px触发切换
    if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
            prevImage();
        } else {
            nextImage();
        }
    }
});

// 添加鼠标滚轮支持
document.addEventListener('wheel', (e) => {
    if (isTransitioning) return;
    
    if (e.deltaY > 0) {
        nextImage();
    } else if (e.deltaY < 0) {
        prevImage();
    }
}, { passive: true });

// 添加点击切换功能
document.addEventListener('click', (e) => {
    if (isTransitioning) return;
    
    const clickX = e.clientX;
    const windowWidth = window.innerWidth;
    
    // 点击左侧1/3区域：上一张
    if (clickX < windowWidth / 3) {
        prevImage();
    }
    // 点击右侧1/3区域：下一张
    else if (clickX > windowWidth * 2 / 3) {
        nextImage();
    }
    // 点击中间区域：切换播放状态
    else {
        toggleSlideshow();
    }
});

async function loadsplashtext() {
    try {
        let splashTexts = [
            "欢迎来到CSECMC服务器！",
            "祝你游戏愉快！",
            "探索无限可能！",
            "与朋友一起冒险！",
            "创造属于你的世界！"
        ];

        // 首先检查是否有特殊文本
        try {
            const specialResponse = await fetch('special.txt');
            if (specialResponse.ok) {
                const specialData = await specialResponse.text();
                if (specialData.trim() !== "") {
                    splashTexts = [specialData.trim()];
                    displaySplashText(splashTexts);
                    return; // 有特殊文本就不加载普通文本
                }
            }
        } catch (e) {
            // special.txt 不存在，继续
        }

        // 加载普通文本文件
        try {
            const splashResponse = await fetch('splash.txt');
            if (splashResponse.ok) {
                const splashData = await splashResponse.text();
                const lines = splashData.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
                
                if (lines.length > 0) {
                    splashTexts = lines;
                }
            }
        } catch (e) {
            // splash.txt 不存在，使用默认文本
        }

        displaySplashText(splashTexts);
    } catch (error) {
        console.error('加载欢迎文本时出错:', error);
    }

    function displaySplashText(texts) {
        const splashTextElement = document.getElementById('splash-text');
        if (!splashTextElement) return;
        
        const randomIndex = Math.floor(Math.random() * texts.length);
        splashTextElement.textContent = texts[randomIndex];
        
        const textLength = splashTextElement.textContent.length;
        splashTextElement.style.right = `${textLength / 9 * 10 * -1}%`;
    }
}
function openWindowWithSize(url, width, height, windowName) {
    // 计算窗口居中位置
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    // 窗口特性参数
    const features = `width=${width},height=${height},left=${left},top=${top}`;
    
    window.open(url, windowName, features);
}