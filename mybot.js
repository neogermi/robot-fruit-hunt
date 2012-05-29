var s7ng6n = function () {
	
	/* constants */
	this.HORIZONTAL  = -1;
	this.VERTICAL    = 1;

	/* variables */
	this.Board         = null;
	this.CurrentTarget = null;
	this.MyPos         = {x : 0, y : 0};
	this.EnemyPos      = {x : 0, y : 0};
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
	
	this.CurrentTarget = 
		(this.CurrentTarget && 
		 has_item(this.Board[this.CurrentTarget.x][this.CurrentTarget.y]))? 
				 this.CurrentTarget : 
				 this.find_next_target();
	if (this.CurrentTarget === null)
		return PASS;
	else {
		if (this.CurrentTarget.x === this.MyPos.x &&
				this.CurrentTarget.y === this.MyPos.y) {
			this.CurrentTarget = null;
			return TAKE;
		} else
			return this.go_to(this.CurrentTarget);
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

s7ng6n.prototype.is_valid_move = function(x, y, move) {
	switch (move) {
		case TAKE:
		case PASS:
			return (x >= 0 && y >= 0 && x < WIDTH && y < HEIGHT);
		case NORTH:
			return (y > 0);
		case SOUTH:
			return (y+1 < HEIGHT);
		case WEST:
			return (x > 0);
		case EAST:
			return (x+1 < WIDTH);
	}
	return false;
};

s7ng6n.prototype.permutations = function(v, m) { //v1.0
    for(var p = -1, j, k, f, r, l = v.length, q = 1, i = l + 1; --i; q *= i);
    for(x = [new Array(l), new Array(l), new Array(l), new Array(l)], j = q, k = l + 1, i = -1;
        ++i < l; x[2][i] = i, x[1][i] = x[0][i] = j /= --k);
    for(r = new Array(q); ++p < q;)
        for(r[p] = new Array(l), i = -1; ++i < l; !--x[1][i] && (x[1][i] = x[0][i],
            x[2][i] = (x[2][i] + 1) % l), r[p][i] = m ? x[3][i] : v[x[3][i]])
            for(x[3][i] = x[2][i], f = 0; !f; f = !f)
                for(j = i; j; x[3][--j] == x[2][i] && (x[3][i] = x[2][i] = (x[2][i] + 1) % l, f = 1));
    return r;
};

/**
 * If the bot shall PASS, return `null`
 * Else: return an object with coordinates {x : 0, y : 0}
 * Note: If you return the coordinates of the bot, that
 * denotes a TAKE, a MOVE otherwise.
 */
s7ng6n.prototype.find_next_target = function () {
	
	//TAKE
	if (this.do_i_still_need(this.Board[this.MyPos.x][this.MyPos.y])) {
		return this.MyPos;
	}
	
	var types = [];
	// this is an array, sorted by the items with the smallest
	// number of items on the board
	for (var t = 1; t <= get_number_of_item_types(); t++) {
		if (this.do_i_still_need(t))
			types[t] = t;
	}
	types.sort(function (a, b) {
		if (get_total_item_count(a) == get_total_item_count(b)) 
			return 0;
		if (get_total_item_count(a) < get_total_item_count(b)) 
			return -1;
		return 1;
	});

	var items = [];
	for (var t = 1; t < (Math.ceil(types.length / 2) + 1); t++) {
		var currentType = types[t];
		for (var x = 0; x < WIDTH; x++) {
			for (var y = 0; y < HEIGHT; y++) {
				var type = this.Board[x][y];
				if (type === currentType) {
					items.push({x : x, y : y, type : type});
				}
			}
		}
	}
	var permutations = this.permutations(items);
	console.log(items.length + " => " + permutations.length);

	var before = new Date().getTime();
	
	var costsOfPath = function (path, myX, myY) {
		var sum = Math.abs(myX - path[0].x) + Math.abs(myY - path[0].y);
		for (var n = 0; n < path.length - 1; n++) {
			sum += Math.abs(path[n].x - path[n+1].x) + Math.abs(path[n].y - path[n+1].y);
		}
		return sum;
	};

	if (permutations.length && permutations[0].length) {
		var bestPath = {path : permutations[0], dist : costsOfPath(permutations[0], this.MyPos.x, this.MyPos.y) };
		for (var p = 1; p < permutations.length; p++) {
			var path = permutations[p];
			var cost = costsOfPath(path, this.MyPos.x, this.MyPos.y);
			
			if (cost < bestPath.dist) {
				bestPath.dist = cost;
				bestPath.path = path;
			}
		}
		var after = new Date().getTime();
		console.log("total took " + ((after - before) / 1000) + " seconds for " + permutations.length + " permutations!");
		if (bestPath.path.length)
			return bestPath.path[0];
	}
	return null; // PASS
};


function new_game() {
	s7ng6nInstance = new s7ng6n();
	var x = [0, 1, 2];
}

function make_move () {
	return s7ng6nInstance.make_move();
}
