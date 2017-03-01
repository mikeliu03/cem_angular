define([], function(){
	angular.module("app").controller("CityManagementCtrl", ["$rootScope", "$scope", "$http", "Citys", function($rootScope, $scope, $http, Citys){		
		
		if($scope.selectLevel == 2){
			$(".xianji-title").text("");
			$(".xianji-title").css("border", "none");
			$(".xianji-content").hide();
		}
		
		$scope.citysRawData = { "bigcity": [], "othercity": []};
		
		Citys.getCitys().then(function(data){
			var dataJson = $.parseJSON(data);			
			$scope.citysRawData.bigcity = dataJson.bigcity;
			$scope.citysRawData.othercity = dataJson.othercity.filter(function(a){
				if(a.level <= $scope.selectLevel){
					return true;
				}
			});
		});
		
		function setInitialStatusForCitys(passCity){
			var cur_citys = passCity.cur_citys;
			var selected_citys = passCity.selected_citys;
			var citys = $.extend(true, [], $scope.citysRawData);
			// 去除已经选择的数据
			var resultBigCitys = [];
			for(var i=0; i<citys.bigcity.length; i++){
				var bigCityTmp = selected_citys.filter(function(a){
					if(a.cityId == citys.bigcity[i].id){
						return true;
					}
				})[0];
				if(!bigCityTmp){ resultBigCitys.push(citys.bigcity[i]); }
			}
			$scope.bigcity = resultBigCitys;

			var resultOtherCitys = [];
			for(var i=0; i<citys.othercity.length; i++){
				var otherCityTmp = selected_citys.filter(function(a){
					if(a.cityId == citys.othercity[i].id){
						return true;
					}
				})[0];
				if(!otherCityTmp){ 
					resultOtherCitys.push(citys.othercity[i]); 
				}
			}
			
			// 选中当前行编辑数据
			resultOtherCitys.forEach(function(a){
				var findCity = cur_citys.filter(function(b){ return b.cityId == a.id; })[0];
				if(findCity){
					a.isChecked = true;					
				}
			});
			
			$scope.othercity = resultOtherCitys;
			
			$scope.othercity.forEach(function(a){
				if(a.isChecked){
					cityCheck(a.id, true);
				}
			});			
		}
		
		$scope.letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
		//$scope.rootid = "1";
		$rootScope.rootid = "1"
		$scope.rootfilter = function(e){
			return e.parentid == $rootScope.rootid;
		}

		$scope.levelOneId = "-1";
		$scope.level1filter = function(e){
			return e.parentid == $scope.levelOneId;
		}

		$scope.levelTwoId = "-1";
		$scope.level2filter = function(e){
			return e.parentid == $scope.levelTwoId;
		}

		$scope.prefixLetter = "A";
		$scope.letterfilter = function(e){
			prefix = $scope.prefixLetter.toUpperCase();
			return e.level == $scope.selectLevel && e._value && e._value.match(new RegExp("^" + prefix));
		}

		$scope.bigcityfilter = function(e){
			var filterResult = $scope.bigcity.filter(function(a){
				if(a.id === e.id) return true;
			});
			if(filterResult.length > 0){
				return true;
			}
		}
		
		$scope.searchCondArr = "";
		
		$scope.searchCity = function(searchVal){
			if(!searchVal || !searchVal.trim()){
				return false;
			}
			Citys.searchCitys({"search": searchVal.toUpperCase(), "level": $scope.selectLevel}).then(function(data){
				console.log(data);
				$scope.searchCondArr = data;
			});
		};
		
		$scope.searchfilter = function(e){
			var searchCondArr = $scope.searchCondArr;
			return searchCondArr.indexOf(e.id.toString()) >= 0;					
		}
		
		$scope.selectedCityFilter = function(e){
			return e.isChecked && e.level == $scope.selectLevel;
		}
		
		$scope.letterClick = function(letter){
			$scope.prefixLetter = letter;
			othercity_flag = false;
		}
		$scope.initCityStyleInArea = function(text){
			var style = "min-width: 110px;";
			if(text.length > 6){
				style = "min-width: 240px;";
			}
			return style;
		}
		$scope.hireachyNodeClick = function(e, level){
			var parentid = e.parentid;
			var id = e.id;
			$scope.othercity.forEach(function(ct){
				if(ct.parentid == parentid){
					ct.isActive = false;
				}
			});
			e.isActive = true;
			switch(level){
				case 0: 
				$scope.levelOneId = id;
				$scope.levelTwoId = "-1";
				break;
				case 1: 
				$scope.levelTwoId = id;
				break;
				case 2:
				break;
			}
		}

		$scope.hireachyInputClick = function(e){
			var isChecked = e.isChecked;
			cityCheck(e.id, isChecked);
		}

		function cityCheck(id, isChecked){
			var checkIds = Citys.getChildrensById(id, $scope.othercity);
			$scope.othercity.every(function(a){
				if(checkIds.indexOf(a.id) >= 0){			
					a.isChecked = isChecked;
					a.isHalfChecked = false;
				}
				return true;
			});
			Citys.getCheckedParentsById(id, isChecked, $scope.othercity);
		}
		
		//全选按钮
		var othercity_flag = false;
		var tabIndex = 0;
		$scope.otherCityAllClick = function(){
			othercity_flag = !othercity_flag;
			
			var _selectedIdArr = [];
			switch(tabIndex){
				case 0: _selectedIdArr = []; break;
				case 1: $(".cem-city-letter .cem-detail-city dd").each(function(i, ele){
					_selectedIdArr.push(ele.getAttribute("data-id"));
				}); break;
				case 2: $(".cem-city-search .cem-detail-city dd").each(function(i, ele){
					_selectedIdArr.push(ele.getAttribute("data-id"));
				}); break; 
			}
			for(var i = 0; i < $scope.othercity.length; i++){
				if(tabIndex == 0 || _selectedIdArr.indexOf($scope.othercity[i].id.toString()) >= 0){
					$scope.othercity[i].isChecked = othercity_flag;
					$scope.othercity[i].isHalfChecked = false;
				}				
			}
		}

		var bigcity_flag = false;
		$scope.bigcityAllClick = function(){
			bigcity_flag = !bigcity_flag;
			for(var i = 0; i < $scope.bigcity.length; i++){
				cityCheck($scope.bigcity[i].id, bigcity_flag);
			}
		}

		$scope.showcity = {
			fisrttirecitys: [],
			secondtiercitys: [],
			thirdtiercitys: [],
			othercitys: []
		};

		var levelConfig = 1; //1:市级，2：县级
		$scope.saveCitys = function(){
			var str = '';
			var obj = [];
			$scope.othercity.forEach(function(a){
				if(a.isChecked && a.parentid != $rootScope.rootid && a.level == $scope.selectLevel){
					obj.push({id: a.id, value: a.value,code:a.id,dimId:$scope.dimId,dimName:$scope.dimName});
				}		
			});
			$.ajax({
				url: "saveCityOpts.ajax",
				type: "POST",
				/*headers: { "Content-Type": "application/x-www-form-urlencoded" },*/
				data: { 	
					data:JSON.stringify(obj)
				},
				dataType: "json"
			}).then(function(data){
				$scope.$emit("CityUpdatedSuccessEvt", data);	
			});
		}
		
		$scope.$on("ShowCityManageModal", function(event, data){
			setInitialStatusForCitys(data);
			$("#cem-city-management").modal("show");
		});
		
		
		$('#myTab a[data-toggle="tab"]').on('show.bs.tab', function (e) {
			tabIndex = $(e.target).closest("li").index();
			othercity_flag = false;
		});
	}]);
});
