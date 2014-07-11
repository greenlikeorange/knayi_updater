var graph = require("fbgraph");
var knayi = require("knayi-myscript");
var mongo = require("mongoose");
var https = require("https");

// Use mongodb to record latest
mongo.connect("mongodb://localhost/knayi_updater");

var PagesSchema = new mongo.Schema({
	name: String,
	page_id: String,
	lastPost: String
}),
	Pages = mongo.model('Pages', PagesSchema);

Pages.remove(function(err){
	// Clear Database for restart	
});

new Pages({
	name: "7Day News Journal", page_id: "103865773008399",lastPost: ""
}).save(function(err){ });

new Pages({
	name: "Eleven Media Group", page_id: "114803668557265",lastPost: ""
}).save(function(err){ });

new Pages({
	name: "Internet Journal", page_id: "267077651421",lastPost: ""
}).save(function(err){ });

// Access Took
graph.setAccessToken("{Knayi Updater Access Took}");

var cangot = "link picture name caption description place tags".split(" ");

function update(page){

	console.log(page.lastPost);
	graph.get( page.page_id + "/posts?limit=1" + page.lastPost, function(err, res) {
		
		if( err ) { 
			console.error(err);
		} else if( res.data.length === 0 ){
			console.log("Already up to date");
		} else {

			var lastPost = res.paging.previous.match(/(since\=(\d)+)/)[0];
			var message = knayi(res.data[0].message).fontConvert().syllbreak();
			var repost = {}; var i = 0;

			// Add footer
			message += "\n\n\nFrom: " + page.name + "\n" + "Post: http://fb.com/" + res.data[0].id;
			repost.message = message;

			for (; i < cangot.length; i++) {
				if( res.data[0][cangot[i]] ){
					repost[cangot[i]] = knayi(res.data[0][cangot[i]]).fontConvert().syllbreak();
				}
			};

			graph.post("181633308558166/feed",
				repost,
				function(err){
				
				if( err ) { 
					console.error(err);
				}else {
					// Resetting Last Post
					Pages.update({name: page.name}, {name: page.name, page_id: page.page_id, lastPost: lastPost}, function(err){});
				}

			});

		}

	});

};

// 10 second loop
setInterval(function(){
	Pages.find({}, function(err, doc){
		for (var i = 0; i < doc.length; i++) {
			update(doc[i]);
		};
	});	
}, 10000);
