(function(angular) {
	'use strict';

	angular.module('ui-slidepanel', [])

	.factory('slidepanelFactory', function($document, $q, $compile, $controller, $rootScope, $templateRequest) {

		return {
			open: SlidePanelOpenFn
		};

		function SlidePanelOpenFn(def) {

			var deferreds = {
				opened: $q.defer(),
				closed: $q.defer()
			};

			var promises = {
				opened: deferreds.opened.promise,
				closed: deferreds.closed.promise
			};

			$templateRequest(def.templateUrl)
				.then(function(template) {
					var body = $document.find('body').eq(0);
					var panelElem = angular
						.element('<div slidepanel></div>')
						.attr({
							'callbacks': '__deferreds',
							'width': def.size
						}).html(template);

					var scope = $rootScope.$new();
					scope.__deferreds = deferreds;
					var panelCtrl = $controller(def.controller, {
						$scope: scope
					});

					var $panelElem = $compile(panelElem)(scope);

					body.append($panelElem);

				}, function() {

					// TODO add more
					deferreds.opened.reject();

				});

			return promises;

		}

	})

	.controller('slidepanelInnerCtrlTest', function($scope, $log) {
		$scope.name = 'Henry';
		$scope.print = function() {
			$log.info("I'm here baby");
		};
	})

	.controller('slidepanelCtrlTest', function($scope, slidepanelFactory) {

		$scope.open = function() {

			var slidepanelInstance = slidepanelFactory.open({
				templateUrl: 'templates/testcontent.html',
				controller: 'slidepanelInnerCtrlTest',
				size: 500
			});

			slidepanelInstance.closed
				.then(function(data) {
					console.log("I was closed with " + data);
				});

		};

	})

	.directive('slidepanel', function SlidePanelDirective() {
		return {
			restrict: 'A',
			scope: {
				width: '@',
				callbacks: '&'
			},
			transclude: true,
			templateUrl: 'templates/slidepanels.html',
			link: function(scope, element, attrs) {
				scope.style = {
					'width': attrs.width + 'px'
				};
			},
			controller: function($scope, $element, $attrs, $log) {
				var callbacks = $scope.callbacks();
				callbacks.opened.resolve();
				$scope.close = function() {
					callbacks.closed.resolve('puppy');
				};
			}
		};
	});



}(angular));