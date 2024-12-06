var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');

var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], localDataCenter: 'datacenter1', keyspace: 'projekat' });
client.connect(function(err,result){
	console.log('index: Cassandra connected');
})

var getListaKompanija = 'SELECT * FROM projekat.kompanija';
var getListaKompanijaFilterIme = "SELECT * FROM projekat.kompanija WHERE ime LIKE ? ALLOW FILTERING";
var imeF;

router.post('/', function(req, res) {
	if(req.body.ime == "")
	{
		client.execute(getListaKompanija,[],function(err,result){
			if(err){
				res.status(404).send({msg: err});
			}
			else{
				res.render('index',{
					kompanija: result.rows
				})
			}
		});
	}
	else{
		imeF= req.body.ime + '%';
		client.execute(getListaKompanijaFilterIme,[imeF],function(err,result){
			if(err){
				res.status(404).send({msg: err});
			}
			else{
				res.render('index',{
					kompanija: result.rows
				})
			}
		});
	}
});

router.get('/', function(req, res) {
	console.log("Get metod pozvan")
		client.execute(getListaKompanija,[],function(err,result){
		if(err){
			res.status(404).send({msg: err});
		}
		else{
			res.render('index',{
				kompanija: result.rows
			})
		}
	});
	
});


module.exports = router;
