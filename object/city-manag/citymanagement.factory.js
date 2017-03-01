define(["jquery"], function(){
	angular.module("app").factory("Citys", function($q, $http, $rootScope){	
		var searchCitys = function(param){
			var deferred = $q.defer();
			$http.post("queryCitiesAllbyParams.ajax", param).success(function(data){
				deferred.resolve(data.rspData);
				//deferred.resolve(data.rspData);
			});
			return deferred.promise;
		};
		
		var getCitys = function(){
			var deferred = $q.defer();
			$http.get("queryCitiesAll.ajax").success(function(data){
				deferred.resolve(data.rspData);
			});
			return deferred.promise;
		};

		function _getCityChildsById(id, citys){
			id = id || $rootScope.rootid;
			var resultCitys = citys.filter(function(cityTmp){
				return cityTmp.parentid == id;
			});

			return resultCitys;
		}

		function _recurseToFindChildrens(id, citys){
			var resultIds = [];
			var citysTmp = _getCityChildsById(id, citys);
			resultIds.push(id);
			citysTmp.forEach(function(a){
				var resultSubIds = _recurseToFindChildrens(a.id, citys);
				resultIds = resultIds.concat(resultSubIds);
			});
			return resultIds;
		}

		var getChildrensById = function(id, citys){
			var checkIds = _recurseToFindChildrens(id, citys);	
			return checkIds;
		}

		var getCheckedParentsById = function(id, isChecked, citys){
			var checkParentIds = [];
			var cityInfo = citys.filter(function(a){
				if(a.id == id){
					return true;
				}
			})[0];
			while(cityInfo && cityInfo.parentid != $rootScope.rootid){
				cityInfo = citys.filter(function(b){
					if(b.id == cityInfo.parentid){
						return true;
					}
				})[0];
				var cityChilrens = _getCityChildsById(cityInfo.id, citys);
				var hasCheckedEle = false, isAllSameStatus = true;
				for(var i = 0; i < cityChilrens.length; i++){
					if(cityChilrens[i].isChecked == isChecked){
						hasCheckedEle = true;
					}else{
						isAllSameStatus = false;
					}
				}

				if(isAllSameStatus){	
					cityInfo.isChecked = isChecked;
					cityInfo.isHalfChecked = false;
					checkParentIds.push(cityInfo.id);
				}else{
					cityInfo.isChecked = false;
					cityInfo.isHalfChecked = true;
				}
				
			}
		}
		return {
			searchCitys: searchCitys,
			getCitys: getCitys,
			getChildrensById: getChildrensById,
			getCheckedParentsById: getCheckedParentsById
		};
	});
});