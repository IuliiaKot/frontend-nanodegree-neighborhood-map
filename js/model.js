// create knockout model to bind to the search element
function yelpBusinessViewModel() {

  var self = this;
	self.searchTerm = ko.observable('Italian cafe');

	//function to update the view model
	self.updateYelpResults = function(){
		// retunr the updated data and create the yelp list
		ko.computed(function(){
			yelpAjax('10012', self.searchTerm());
		}, self);
	}
}

ko.applyBindings(new yelpBusinessViewModel());
