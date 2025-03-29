const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const MAP_WIDTH = 80, MAP_HEIGHT = 60, TILE_SIZE = 10;
let world = [], people = [];

const manEmoji = '👨', womanEmoji = '👩', pregnantEmoji = '🤰';
const babyBoyEmoji = '👶', babyGirlEmoji = '👼';
const peeEmoji = '💧', poopEmoji = '💩';
const diaperClean = '⬜', diaperPee = '🟨', diaperPoop = '🟫';

function createWorld() {
    for (let i = 0; i < MAP_WIDTH; i++) {
        world[i] = [];
        for (let j = 0; j < MAP_HEIGHT; j++) {
            world[i][j] = '';
        }
    }

    setInterval(spawnPerson, 15000, 'man');
    setInterval(spawnPerson, 15000, 'woman');
}

function renderWorld() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < MAP_WIDTH; i++) {
        for (let j = 0; j < MAP_HEIGHT; j++) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.font = '16px Arial';
            ctx.fillText(world[i][j], i * TILE_SIZE + 2, j * TILE_SIZE + 8);
        }
    }

    for (let person of people) {
        ctx.fillText(person.emoji, person.x * TILE_SIZE + 2, person.y * TILE_SIZE + 8);
        if (person.diaper) {
            ctx.fillText(person.diaper, (person.x + 1) * TILE_SIZE + 2, person.y * TILE_SIZE + 8);
        }
    }
}

function spawnPerson(type) {
    let x = Math.floor(Math.random() * MAP_WIDTH), y = Math.floor(Math.random() * MAP_HEIGHT);
    let emoji = type === 'man' ? manEmoji : womanEmoji;
    
    let person = { type, emoji, x, y, children: 0, canGetPregnant: true }; // A mãe pode engravidar inicialmente

    if (type === 'woman') {
        setTimeout(() => {
            startPregnancyCycle(person, 30000); // Primeiro filho após 30s
        }, 45000); // Mãe engravida pela primeira vez após 45s
    }

    people.push(person);
    renderWorld();
}

function startPregnancyCycle(mother, delay) {
    if (mother.children >= 3) {
        mother.canGetPregnant = false; // Mãe não pode engravidar mais
        return; // Impede novas gravidezes
    }

    setTimeout(() => {
        if (people.includes(mother) && mother.canGetPregnant) {
            mother.emoji = pregnantEmoji;
            renderWorld();
            setTimeout(() => {
                if (people.includes(mother)) {
                    let isGirl = Math.random() > 0.5;
                    let baby = {
                        type: 'baby',
                        emoji: isGirl ? babyGirlEmoji : babyBoyEmoji, // Bebê mantém o sexo original
                        x: mother.x,
                        y: mother.y,
                        diaper: diaperClean,
                        age: 'baby',
                        gender: isGirl ? 'girl' : 'boy' // Armazenando o sexo do bebê
                    };

                    people.push(baby);
                    mother.emoji = womanEmoji;
                    mother.children += 1;
                    renderWorld();

                    startDiaperCycle(baby);

                    // Se ainda pode ter mais filhos, agenda a próxima gravidez
                    if (mother.children === 1) {
                        startPregnancyCycle(mother, 60000); // Segundo filho após 1 min
                    } else if (mother.children === 2) {
                        startPregnancyCycle(mother, 120000); // Terceiro filho após 2 min
                    }
                }
            }, 15000); // Bebê nasce após 15s de gravidez
        }
    }, delay);
}

function startDiaperCycle(baby) {
    setInterval(() => {
        if (baby.age === 'baby') {
            let rand = Math.random();
            if (rand < 0.5) {
                baby.diaper = diaperPee + peeEmoji;
                removeWaste(baby, peeEmoji);
            } else {
                baby.diaper = diaperPoop + poopEmoji;
                removeWaste(baby, poopEmoji);
            }
            renderWorld();
        }
    }, 30000);
}

function removeWaste(baby, waste) {
    setTimeout(() => {
        if (baby.diaper.includes(waste)) {
            baby.diaper = diaperClean;
            renderWorld();
        }
    }, Math.floor(Math.random() * 30000) + 1000);
}

createWorld();
