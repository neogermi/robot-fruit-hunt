var s7ng6n = function () {
	
	/* constants */
	this.HORIZONTAL  = -1;
	this.VERTICAL    = 1;

	/* variables */
	this.Board        = null;
	this.MyPos        = {x : 0, y : 0};
	this.EnemyPos     = {x : 0, y : 0};
};

/* methods */
s7ng6n.prototype.init_vars = function () {
	this.Board = get_board();
	this.MyPos = {
			x : get_my_x(),
			y : get_my_y()
	};
	this.EnemyPos = {
			x : get_opponent_x(),
			y : get_opponent_y()
	};
};

s7ng6n.prototype.make_move = function () {
	// init some convenience variables
	this.init_vars();
	
	var nextTarget = this.find_next_target();
	if (nextTarget === null)
		return PASS;
	else {
		if (nextTarget.x === this.MyPos.x &&
			nextTarget.y === this.MyPos.y) {
			return TAKE;
		} else
			return this.go_to(nextTarget);
	}
};

s7ng6n.prototype.dir_to_move = function (dir, offset) {
	if (dir == this.HORIZONTAL) {
		if (offset < 0) 
			return WEST;
		else if (offset > 0)
			return EAST;
	} else {
		if (offset < 0) 
			return NORTH;
		else if (offset > 0)
			return SOUTH;
	}
	return PASS;
};

s7ng6n.prototype.go_to = function (target) {
	var hOffs = target.x - this.MyPos.x;
	var vOffs = target.y - this.MyPos.y;
	
	if (hOffs === vOffs || Math.abs(hOffs) > Math.abs(vOffs)) {
		return this.dir_to_move(this.HORIZONTAL, hOffs);
	} else {
		return this.dir_to_move(this.VERTICAL, vOffs);
	}
};

s7ng6n.prototype.do_i_still_need = function (type) {
	if (!has_item(type)) return false;
	
	var total_num = get_total_item_count(type);
	var i_have = get_my_item_count(type);
	var the_other_has = get_opponent_item_count(type);
//
//	var enemyField = this.Board[this.EnemyPos.x][this.EnemyPos.y];
//	if (has_item(enemyField)) {
//		if (this.EnemyPos.x !== this.MyPos.x ||
//				this.EnemyPos.y !== this.MyPos.y) {
//			the_other_has += 1;
//		}
//	}
//	
	return !(i_have > total_num / 2 || the_other_has > total_num / 2);
};

/**
 * If the bot shall PASS, return `null`
 * Else: return an object with coordinates {x : 0, y : 0}
 * Note: If you return the coordinates of the bot, that
 * denotes a TAKE, a MOVE otherwise.
 */
s7ng6n.prototype.find_next_target = function () {
	var items = [];
	for (var x = 0; x < WIDTH; x++) {
		for (var y = 0; y < HEIGHT; y++) {
			var type = this.Board[x][y];
			if (this.do_i_still_need(type)) {
				var dist = Math.abs(this.MyPos.x - x) + Math.abs(this.MyPos.y - y);
				items.push({x : x, y : y, dist : dist, type : type});
			}
		}
	}
	
	// this is an array of all items, ranked by distance,
	// closest first
	items.sort(function (a, b) {
		if (a.dist < b.dist) 
			return -1; 
		if (a.dist == b.dist) 
			return 0; 
		return 1;
	});
	
	var types = [];
	// this is an array, sorted by the items with the smallest
	// number of items on the board
	for (var t = 1; t <= get_number_of_item_types(); t++) {
		var total_num = get_total_item_count(t);
		types[total_num] = t;		
	}

	var currentType = 1;
	for (var t = 0; t < types.length; t++) {
		var type = types[t];
		if (type && this.do_i_still_need(type)) {
			currentType = type;
			break;
		}
	}
	
	for (var i = 0; i < items.length; i++) {
		var item = items[i];
		if (item.type == currentType) {
			return item;
		}
	}
	// PASS
	return null;
};


function new_game() {
	s7ng6nInstance = new s7ng6n();
}

function make_move () {
	return s7ng6nInstance.make_move();
}
