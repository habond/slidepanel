(function(angular) {
	'use strict';

	angular.module('ui-slidepanel', [])

	.factory('slidepanelFactory', function($document, $q, $compile, $controller, $rootScope, $templateRequest) {

		return {
			open: SlidePanelOpenFn
		};

		function SlidePanelOpenFn(def) {

			var events = {
				opened: $q.defer(),
				closed: $q.defer(),
				beforeClose: null,
				beforeDismiss: null
			};

			var instance = {
				elem: null,
				scope: null,
				closed: events.closed.promise,
				opened: events.opened.promise,
				close: RequestClose,
				dismiss: RequestDismiss,
				on: function (event, eventfn) { 
					events[event] = eventfn; 
					return this; 
				}
			};

			function RequestClose(ret) {
				if(angular.isFunction(events.beforeClose))
					if(!events.beforeClose()) return false;
				DestoryInstance();
				events.closed.resolve(ret);
				return true;
			}

			function RequestDismiss(ret) {
				if(angular.isFunction(events.beforeDismiss))
					if(!events.beforeDismiss()) return false;
				DestoryInstance();
				events.closed.reject(ret);
				return true;
			}

			function DestoryInstance() {
				instance.scope.$destroy();
				instance.elem.remove();
			}

			function CreateInstance(template) {
				var scope = instance.scope = $rootScope.$new();
				scope._spInstance = instance;
				var panelCtrl = $controller(def.controller, {
					'$scope': scope,
					'spInstance': instance
				});

				var elem = instance.elem = angular
					.element('<div slidepanel></div>')
					.attr({
						'dismiss': '_spInstance.dismiss',
						'size': def.size
					})
					.html(template);

				$compile(elem)(scope);
				var body = $document.find('body').eq(0);
				body.append(elem);

				events.opened.resolve();
			}

			function TemplateRequestFail(err) {
				events.opened.reject(err);
			}

			$templateRequest(def.templateUrl)
				.then(CreateInstance, TemplateRequestFail);

			return instance;

		}

	})

	.directive('slidepanel', function SlidePanelDirective() {
		return {
			restrict: 'A',
			scope: {
				size: '@',
				dismiss: '&dismiss'
			},
			transclude: true,
			link: function(scope, element, attrs, controller, transcludeFn) {
				var panel = angular
					.element('<div></div>')
					.addClass('sp-panel sp-left')
					.append(transcludeFn());
				panel[0].style.width = attrs.size;

				var dim = angular
					.element('<div></div>')
					.addClass('sp-dim sp-open')
					.on('click', scope.dismiss());

				element
					.append(panel)
					.append(dim);
			}
		};
	});

}(angular));