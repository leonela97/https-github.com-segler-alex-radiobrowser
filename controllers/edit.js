var app = angular.module('RadioBrowserApp');

app.controller('EditController', function(radiobrowser) {
    var vm = this;

    function open(sth) {
        console.log("open");
        var modalInstance = $uibModal.open({
            animation: vm.animationsEnabled,
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                items: function() {
                    return sth;
                }
            }
        });

        modalInstance.result.then(function() {
            console.log("closed");
        }, function() {
            console.log("dismissed");
        });
    };

    function updateImageList(url) {
        radiobrowser.post('/webservice/json/extract_images', {
            'url': url
        }).then(function(data) {
            vm.imageList = data.data;
            if (data.data.ok === "true") {
                vm.imageList = data.data.images;
            } else {
                vm.imageList = [];
            }
        }, function(err) {
            console.log("error:" + JSON.stringify(err));
        });
    }

    function updateSimiliar(name) {
        radiobrowser.post('/webservice/json/stations/byname/' + name, {
            limit: 20
        }).then(function(data) {
            if (vm.editStation.id) {
                var stations = [];
                for (var i = 0; i < data.data.length; i++) {
                    var station = data.data[i];
                    if (station.id !== vm.editStation.id) {
                        stations.push(station);
                    }
                }
                vm.similiarStations = stations;
            } else {
                vm.similiarStations = data.data;
            }
        }, function(err) {
            console.log("error:" + err);
        });
    }

    vm.addTag = function(tag) {
        vm.editStation.tags_arr.splice(0, 0, tag);
        vm.editStation.tag = "";
    }

    vm.removeTag = function(tag) {
        var index = vm.editStation.tags_arr.indexOf(tag);
        if (index !== -1) {
            vm.editStation.tags_arr.splice(index, 1);
        }
    }

    vm.sendStation = function() {
        if (vm.editStation !== null) {
            vm.activeSending = true;
            console.log("---" + vm.editStation.id);
            vm.editStation.tags = "";
            if (vm.editStation.tags_arr) {
                vm.editStation.tags = vm.editStation.tags_arr.join(',');
            }
            if (undefined === vm.editStation.id) {
                url = '/webservice/json/add';
            } else {
                url = '/webservice/json/edit/' + vm.editStation.id;
                vm.editStation.stationid = vm.editStation.id;
            }
            radiobrowser.post(url, vm.editStation).then(function(response) {
                console.log("ok:" + JSON.stringify(response));
                vm.editStation = null;
                vm.clearList();
                vm.activeSending = false;
                vm.similiarStations = [];
                vm.imageList = [];
                vm.open(response);
            }, function(err) {
                console.log("error:" + err);
            });
        }
    }

    vm.editStation = null;
    vm.activeSending = false;
    vm.similiarStations = [];
    vm.imageList = [];

    vm.open = open;
    vm.updateImageList = updateImageList;
    vm.updateSimiliar = updateSimiliar;
});