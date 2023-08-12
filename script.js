const SIZE = 40
const COLS = Math.floor((window.innerWidth - 16 * 2) / SIZE)
const ROWS = Math.floor((window.innerHeight - 16 * 2 - 72) / SIZE)
const FPS = 5

const APPLE = 'assets/apple.png'
const BODY_BL = 'assets/body_bl.png'
const BODY_BR = 'assets/body_br.png'
const BODY_HORIZONTAL = 'assets/body_horizontal.png'
const BODY_TL = 'assets/body_tl.png'
const BODY_TR = 'assets/body_tr.png'
const BODY_VERTICAL = 'assets/body_vertical.png'
const HEAD_DOWN = 'assets/head_down.png'
const HEAD_LEFT = 'assets/head_left.png'
const HEAD_RIGHT = 'assets/head_right.png'
const HEAD_UP = 'assets/head_up.png'
const TAIL_DOWN = 'assets/tail_down.png'
const TAIL_LEFT = 'assets/tail_left.png'
const TAIL_RIGHT = 'assets/tail_right.png'
const TAIL_UP = 'assets/tail_up.png'

const WIDTH = COLS * SIZE
const HEIGHT = ROWS * SIZE

const canvas = document.getElementById('game-area')

canvas.width = WIDTH
canvas.height = HEIGHT

context = canvas.getContext('2d')

class Vector {
	constructor(x, y) {
		this.x = x
		this.y = y
	}

	subtract(vector) {
		return new Vector(this.x - vector.x, this.y - vector.y)
	}

	add(vector) {
		return new Vector(this.x + vector.x, this.y + vector.y)
	}
}

const apple = {
	image: loadImage(APPLE),
	randomize: function () {
		this.x = randInt(0, COLS - 1)
		this.y = randInt(0, ROWS - 1)
	},
	draw: function () {
		context.drawImage(this.image, this.x * SIZE, this.y * SIZE, SIZE, SIZE)
	},
}

const snake = {
	body_bl: loadImage(BODY_BL),
	body_br: loadImage(BODY_BR),
	body_horizontal: loadImage(BODY_HORIZONTAL),
	body_tl: loadImage(BODY_TL),
	body_tr: loadImage(BODY_TR),
	body_vertical: loadImage(BODY_VERTICAL),
	head_down: loadImage(HEAD_DOWN),
	head_left: loadImage(HEAD_LEFT),
	head_right: loadImage(HEAD_RIGHT),
	head_up: loadImage(HEAD_UP),
	tail_down: loadImage(TAIL_DOWN),
	tail_left: loadImage(TAIL_LEFT),
	tail_right: loadImage(TAIL_RIGHT),
	tail_up: loadImage(TAIL_UP),
	body: [
		new Vector(4, 0),
		new Vector(3, 0),
		new Vector(2, 0),
		new Vector(1, 0),
	],
	direction: new Vector(0, 0),
	new_block: false,

	draw: function () {
		this.body.forEach((block, index, body) => {
			if (index === 0) {
				const relation = block.subtract(body[index + 1])
				if (relation.x === 0 && relation.y === -1)
					this.head = this.head_up
				else if (relation.x === 0 && relation.y === 1)
					this.head = this.head_down
				else if (relation.x === -1 && relation.y === 0)
					this.head = this.head_left
				else if (relation.x === 1 && relation.y === 0)
					this.head = this.head_right

				context.drawImage(
					this.head,
					block.x * SIZE,
					block.y * SIZE,
					SIZE,
					SIZE
				)
			} else if (index === this.body.length - 1) {
				const relation = block.subtract(body[index - 1])
				if (relation.x === 0 && relation.y === -1)
					this.tail = this.tail_up
				else if (relation.x === 0 && relation.y === 1)
					this.tail = this.tail_down
				else if (relation.x === -1 && relation.y === 0)
					this.tail = this.tail_left
				else if (relation.x === 1 && relation.y === 0)
					this.tail = this.tail_right

				context.drawImage(
					this.tail,
					block.x * SIZE,
					block.y * SIZE,
					SIZE,
					SIZE
				)
			} else {
				const prev = this.body[index - 1].subtract(block)
				const next = this.body[index + 1].subtract(block)

				if (prev.x === next.x)
					context.drawImage(
						this.body_vertical,
						block.x * SIZE,
						block.y * SIZE,
						SIZE,
						SIZE
					)
				else if (prev.y === next.y)
					context.drawImage(
						this.body_horizontal,
						block.x * SIZE,
						block.y * SIZE,
						SIZE,
						SIZE
					)
				else {
					if (
						(prev.x === -1 && next.y === -1) ||
						(prev.y === -1 && next.x === -1)
					)
						context.drawImage(
							this.body_tl,
							block.x * SIZE,
							block.y * SIZE,
							SIZE,
							SIZE
						)
					else if (
						(prev.x === 1 && next.y === -1) ||
						(prev.y === -1 && next.x === 1)
					)
						context.drawImage(
							this.body_tr,
							block.x * SIZE,
							block.y * SIZE,
							SIZE,
							SIZE
						)
					else if (
						(prev.x === -1 && next.y === 1) ||
						(prev.y === 1 && next.x === -1)
					)
						context.drawImage(
							this.body_bl,
							block.x * SIZE,
							block.y * SIZE,
							SIZE,
							SIZE
						)
					else if (
						(prev.x === 1 && next.y === 1) ||
						(prev.y === 1 && next.x === 1)
					)
						context.drawImage(
							this.body_br,
							block.x * SIZE,
							block.y * SIZE,
							SIZE,
							SIZE
						)
				}
			}
		})
	},
	update: function () {
		if (!(this.direction.x === 0 && this.direction.y === 0)) {
			const new_body = this.body.slice(
				0,
				this.new_block ? this.body.length : -1
			)
			new_body.unshift(this.body[0].add(this.direction))
			this.body = new_body
			this.new_block = false
		}
	},
	reset: function () {
		this.body = [
			new Vector(4, 0),
			new Vector(3, 0),
			new Vector(2, 0),
			new Vector(1, 0),
		]
		this.direction = new Vector(0, 0)
	},
}

const scores = {
	current: 0,
	highest: Number(localStorage.getItem('highest')) || 0,
	draw: function () {
		document.getElementById('current-scores').innerHTML = this.current
		document.getElementById('highest-scores').innerHTML = this.highest
	},
	addScore: function () {
		this.current += 1
		this.highest = Math.max(this.current, this.highest)
		localStorage.setItem('highest', this.highest)
	},
}

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

function loadImage(path) {
	const image = new Image()
	image.src = path
	return image
}

function drawGameBoard() {
	for (let i = 0; i < COLS; i++) {
		for (let j = 0; j < ROWS; j++) {
			if ((i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0)) {
				context.fillStyle = '#a2d148'
				context.fillRect(i * SIZE, j * SIZE, SIZE, SIZE)
			}
		}
	}
}

apple.randomize()

document.addEventListener('keydown', e => {
	if (
		!(snake.direction.x === 0 && snake.direction.y === 1) &&
		e.code === 'ArrowUp'
	)
		snake.direction = new Vector(0, -1)
	else if (
		!(snake.direction.x === 0 && snake.direction.y === -1) &&
		e.code === 'ArrowDown'
	)
		snake.direction = new Vector(0, 1)
	else if (
		!(snake.direction.x === 1 && snake.direction.y === 0) &&
		e.code === 'ArrowLeft'
	)
		snake.direction = new Vector(-1, 0)
	else if (
		!(snake.direction.x === -1 && snake.direction.y === 0) &&
		e.code === 'ArrowRight'
	)
		snake.direction = new Vector(1, 0)
})

function isGameOver() {
	if (
		snake.body[0].x < 0 ||
		snake.body[0].y < 0 ||
		snake.body[0].x > COLS - 1 ||
		snake.body[0].y > ROWS - 1
	) {
		return true
	}

	for (let i = 1; i < snake.body.length; i++) {
		if (
			snake.body[i].x === snake.body[0].x &&
			snake.body[i].y === snake.body[0].y
		) {
			return true
		}
	}

	return false
}

function loop() {
	context.clearRect(0, 0, WIDTH, HEIGHT)

	drawGameBoard()
	apple.draw()
	snake.draw()
	snake.update()
	scores.draw()

	if (snake.body[0].x === apple.x && snake.body[0].y === apple.y) {
		scores.addScore()
		snake.new_block = true
	}

	snake.body.forEach(block => {
		if (block.x === apple.x && block.y === apple.y) {
			apple.randomize()
		}
	})

	if (isGameOver()) {
		snake.reset()
		scores.current = 0
	}
}

setInterval(loop, 1000 / FPS)
