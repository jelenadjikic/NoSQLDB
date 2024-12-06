$(document).ready(function(){
	$('.obrisikompaniju').on('click',obrisiKompaniju)
});

function obrisiKompaniju(){
	event.preventDefault();
	var confirmation=confirm('Da li sigurno zelite da obrisete ovu kompaniju?');
	if(confirmation){
		$.ajax({
			type: 'DELETE',
			url: '/kompanija/'+ $('.obrisikompaniju').data('id')
		}).done(function(response){
			window.location.replace('/');
		})
	}
	else{
		return false;
	}
}