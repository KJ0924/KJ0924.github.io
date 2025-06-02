let rotateYSpeed = 0.05;

async function startTransitionIn() {
    const page = document.querySelector("body>div");
    const canvas = document.createElement('canvas');
    document.querySelector("body").appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    await new Promise(requestAnimationFrame); // 렌더링 완료 보장
    const snapshotCanvas = await html2canvas(page, {
        useCORS: true,
        backgroundColor: null,
        scale: window.devicePixelRatio,
    });

    const tileSizeX = snapshotCanvas.width / 10;
    const tileSizeY = snapshotCanvas.height / 10;
    const particles = [];

    for (let y = 0; y < snapshotCanvas.height; y += tileSizeY) {
        for (let x = 0; x < snapshotCanvas.width; x += tileSizeX) {
            particles.push({
                x: -tileSizeX,
                y: -tileSizeY,
                sx: x,
                sy: y,
                speed: 30,
                rotateY: 0,
                rotateYSpeed: rotateYSpeed,
                delay: Math.random() * 3000,
                startTime: null

            });
        }
    }

    canvas.style.display = 'block';

    function animate(timestamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;

        for (const p of particles) {
            if (!p.startTime) p.startTime = timestamp;
            const elapsed = timestamp - p.startTime;

            if (elapsed < p.delay) {
                ctx.save();
                ctx.drawImage(
                    snapshotCanvas,
                    p.sx, p.sy, tileSizeX, tileSizeY,
                    p.x, p.y, tileSizeX, tileSizeY
                );
                ctx.restore();
                alive = true;
                continue;
            }
            // 보간 이동
            p.x += (p.sx - p.x) * 0.1;
            p.y += (p.sy - p.y) * 0.1;
            p.rotateY += p.rotateYSpeed;
            p.alpha += (1 - p.alpha) * 0.05;
            if ( Math.abs(p.x - p.sx) > 0.5 || Math.abs(p.y - p.sy) > 0.5 || Math.cos(p.rotateY) < 0.95) {
                alive = true;
            } else {
                p.rotateY = 0;
            }

            ctx.save();
            ctx.translate(p.x + tileSizeX / 2, p.y + tileSizeY / 2);
            const scaleX = Math.cos(p.rotateY);
            ctx.transform(scaleX, 0, 0, 1, 0, 0);
            ctx.drawImage(
                snapshotCanvas,
                p.sx, p.sy, tileSizeX, tileSizeY,
                -tileSizeX / 2, -tileSizeY / 2, tileSizeX, tileSizeY
            );
            ctx.restore();
        }

        ctx.globalAlpha = 1.0;
        if (alive) {
            requestAnimationFrame(animate);
        } else {
            canvas.style.display = 'none';
            page.style.left = 0;
        }
    }

    requestAnimationFrame(animate);
}

async function startTransitionOut(nextUrl) {
    const page = document.querySelector("body>div");
    const canvas = document.createElement('canvas');
    document.querySelector("body").appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    await new Promise(requestAnimationFrame); // 렌더링 완료 보장
    const snapshotCanvas = await html2canvas(page, {
        useCORS: true,
        backgroundColor: null,
        scale: window.devicePixelRatio,
    });

    const tileSizeY = snapshotCanvas.height / 10;
    const tileSizeX = snapshotCanvas.width / 10;
    const particles = [];

    for (let y = 0; y < snapshotCanvas.height; y += tileSizeY) {
        for (let x = 0; x < snapshotCanvas.width; x += tileSizeX) {
            particles.push({
                sx: x,
                sy: y,
                x: x,
                y: y,
                speed: 30,
                rotateY: 0,
                rotateYSpeed: rotateYSpeed,
                alpha: 1,
                delay: Math.random() * 3000,
                startTime: null
            });
        }
    }
    page.remove();
    canvas.style.display = 'block';

    function animate(timestamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;

        for (const p of particles) {
            if (!p.startTime) p.startTime = timestamp;
            const elapsed = timestamp - p.startTime;

            if (elapsed < p.delay) {
                ctx.save();
                ctx.drawImage(
                    snapshotCanvas,
                    p.sx, p.sy, tileSizeX, tileSizeY,
                    p.sx, p.sy, tileSizeX, tileSizeY
                );
                ctx.restore();
                alive = true;
                continue;
            }

            p.x -= p.speed;
            p.y -= p.speed;
            p.rotateY += p.rotateYSpeed;
            p.alpha -= 0.01;

            if (p.alpha > 0) {
                alive = true;
                ctx.save();
                ctx.translate(p.x + tileSizeX / 2, p.y + tileSizeY / 2);
                const scaleX = Math.cos(p.rotateY);
                ctx.transform(scaleX, 0, 0, 1, 0, 0);
                ctx.globalAlpha = p.alpha;
                ctx.drawImage(
                    snapshotCanvas,
                    p.sx, p.sy, tileSizeX, tileSizeY,
                    -tileSizeX / 2, -tileSizeY / 2, tileSizeX, tileSizeY
                );
                ctx.restore();
            }
        }

        ctx.globalAlpha = 1.0;
        if (alive) {
            requestAnimationFrame(animate);
        } else {
            // canvas.style.display = 'none';
            // startTransitionIn();
            location.assign(nextUrl);
        }
    }

    requestAnimationFrame(animate);
}
const selector = function(query){
    const eles = document.querySelectorAll(query);
    switch(eles.length){
        case 0:
            return null;
        case 1:
            return eles[0];
        default:
            return eles;
    }
}
window.$=selector;