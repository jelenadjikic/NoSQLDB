var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');

var client = new cassandra.Client({ contactPoints: ['127.0.0.1'], localDataCenter: 'datacenter1', keyspace: 'projekat' });
client.connect(function(err,result){
	console.log('dodajkompaniju: Cassandra connected');
})


/* GET kompanije listing. */
router.get('/', function(req, res) {
	res.render('dodajkompaniju');
});

/* POST dodaj kompaniju */
router.post('/', function(req, res) {
	if(req.body.ime=="" ||req.body.adresa=="" ||req.body.email=="" ||req.body.telefon=="" ||req.body.opis=="" ||req.body.tehnologije=="" ||req.body.brojZaposlenih=="" ||req.body.prosecnaPlata=="")
	{
		console.log("Morate popuniti sva polja! Kompanija nije dodata!");
		res.redirect('/');
	}
	else{
			id = cassandra.types.uuid();
			var dodavanjeKompanije='INSERT INTO projekat.kompanija(id, ime, adresa, email, telefon, opis, tehnologije, brojZaposlenih, prosecnaPlata) VALUES (?,?,?,?,?,?,?,?,?)';
			client.execute(dodavanjeKompanije,[id,req.body.ime,req.body.adresa,req.body.email,req.body.telefon,req.body.opis,req.body.tehnologije,req.body.brojZaposlenih,req.body.prosecnaPlata],function(err,result){
			if(err){
				res.status(404).send({msg: err});
			}
			else{
				console.log('Kompanija uspesno dodata');
				res.redirect('/');
			}
			});
		}
});

module.exports = router;
