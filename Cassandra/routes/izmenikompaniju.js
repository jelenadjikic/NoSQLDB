var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');

var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], localDataCenter: 'datacenter1', keyspace: 'projekat' });
client.connect(function(err,result){
	console.log('izmenikompaniju: Cassandra connected');
})

var getInfoOKompanijiId = 'SELECT * FROM projekat.kompanija WHERE id = ?';
/* GET users listing. */
router.get('/:id', function(req, res) {
	client.execute(getInfoOKompanijiId,[req.params.id],function(err,result){
		if(err){
			res.status(404).send({msg: err});
		}
		else{
			res.render('izmenikompaniju',{
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

/* POST izmeni kompaniju */
router.post('/', function(req, res) {
	var izmenaKompanije='INSERT INTO projekat.kompanija(id, ime, adresa, email, telefon, opis, tehnologije, brojzaposlenih, prosecnaplata) VALUES (?,?,?,?,?,?,?,?,?)';

	client.execute(izmenaKompanije,[req.body.id,req.body.ime,req.body.adresa,req.body.email,req.body.telefon,req.body.opis,req.body.tehnologije,req.body.brojzaposlenih,req.body.prosecnaplata],function(err,result){
	if(err){
			res.status(404).send({msg: err});
		}
		else{
			console.log('Kompanija uspesno izmenjena');
			res.redirect('/');
		}
	});
});

module.exports = router;
