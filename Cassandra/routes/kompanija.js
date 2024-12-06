var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');

var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], localDataCenter: 'datacenter1', keyspace: 'projekat' });
client.connect(function(err,result){
	console.log('kompanija: Cassandra connected');
})

var getInfoOKompanijiId = 'SELECT * FROM projekat.kompanija WHERE id = ?';
/* GET users listing. */
router.get('/:id', function(req, res) {
	client.execute(getInfoOKompanijiId,[req.params.id],function(err,result){
		if(err){
			res.status(404).send({msg: err});
		}
		else{
			res.render('kompanija',{
				id: result.rows[0].id,
				ime: result.rows[0].ime,
				adresa: result.rows[0].adresa,
				email: result.rows[0].email,
				telefon: result.rows[0].telefon,
				opis: result.rows[0].opis,
				tehnologije: result.rows[0].tehnologije,
				brojzaposlenih: result.rows[0].brojzaposlenih,
				prosecnaplata: result.rows[0].prosecnaplata
			})
		}

	});
});

var obrisiKompanijuID ='DELETE FROM projekat.kompanija WHERE id= ?';
router.delete('/:id',function(req,res){
	client.execute(obrisiKompanijuID,[req.params.id],function(err,result){
		if(err){
			res.status(404).send({msg: err});
		}
		else{
			res.json(result);
		}
		
	});
});
module.exports = router;
