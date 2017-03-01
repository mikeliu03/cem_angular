define(['utils'], function(utils){
	angular.module("app").controller("CityListCtrl", ["$rootScope", "$scope", "$http", function($rootScope, $scope, $http){			
		$http.get("getCityTypeList.ajax").then(function(response){
			$scope.cityTypeList = response.data.cityTypeList;
		});
		
		$scope.editCitysType = function(cityTypeId, cityTypeName){
			var cur_citys = [];
			var selected_citys = [];
			$scope.cityTypeList.forEach(function(ele){
				if(ele.id == cityTypeId){
					cur_citys = ele.cityList;
				}else{
					selected_citys = selected_citys.concat(ele.cityList);
				}
			});
			
			$scope.$emit("EditCityTypeEvt", { "cur_citys": cur_citys, "selected_citys": selected_citys, "dimId": cityTypeId, "dimName": cityTypeName  });				
		}
		
		$scope.clearCitysType = function(cityTypeId){
			// 获取数据提交请求？
			var obj = [];
			
			var cur_citys = [];
			$scope.cityTypeList.forEach(function(ele){
				if(ele.id == cityTypeId){
					cur_citys = ele.cityList;
				}
			});

			if(cur_citys.length <= 0) return;
			
			cur_citys.forEach(function(e){
				obj.push({id:e.id, value: e.name,dimId:e.dimId,dimName:e.dimName});
			});
			console.log(obj);
			utils.cem_alert("确定要清空设置吗？",function(){
				utils.post("clearCityOpts.ajax",{data:JSON.stringify(obj)},function(data){
					var leftCityList = [];
					$scope.cityTypeList.forEach(function(ele){
						if(ele.id == cityTypeId){
							ele.cityList = [];
						}
					});
					$scope.$apply();
					utils.cem_message(data);
					//$("#cem_message").click();
				});
			});
		};
		
		$scope.$on("UpdateCityTypeList", function(event, data){
			var citys = $.parseJSON(data.data);			
			var selectedIndex = -1;
			for(var i = 0; i < $scope.cityTypeList.length; i++){
				if($scope.cityTypeList[i].id == $scope.dimId){
					selectedIndex = i;
					break;
				}
			}
			
			if(selectedIndex >= 0){				
				var _tmpArr = [];
				citys.forEach(function(a){
					_tmpArr.push($.extend(a, {"name": a.value}, true));
				});
				$scope.cityTypeList[selectedIndex].cityList = _tmpArr;
			}
			$scope.$apply();
			//setInitialStatusForCitys(data);
			$("#cem-city-management").modal("hide");
		});
	}]);
});
