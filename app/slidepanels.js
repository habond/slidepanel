(function(angular) {
	'use strict';

	angular.module('ui-slidepanel', [])

	.factory('slidepanelFactory', function($document, $q, $compile, $controller, $timeout, $rootScope, $templateRequest) {

		return {
			open: SlidePanelOpenFn
		};

		function SlidePanelOpenFn(def) {

			var body = $document.find('body').eq(0);

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
				instance.scope.$broadcast('spClosing');
				$timeout(function(){
					instance.scope.$destroy();
					instance.elem.remove();
					body.removeClass('sp-overflow-hidden');
				}, 300);
			}

			function CreateInstance(template) {
				var scope = instance.scope = $rootScope.$new();
				scope._spInstance = instance;
				var locals = {
					'$scope': scope,
					'spInstance': instance
				};
				angular.extend(locals, def.data || {});
				var panelCtrl = $controller(def.controller, locals);

				var elem = instance.elem = angular
					.element('<div slidepanel></div>')
					.attr({
						'position': def.position,
						'size': def.size,
						'dismiss': '_spInstance.dismiss'
					})
					.html(template);

				$compile(elem)(scope);
				body.addClass('sp-overflow-hidden');
				body.append(elem);
				events.opened.resolve(instance);
			}

			function TemplateRequestFail(err) {
				events.opened.reject(err);
			}

			$templateRequest(def.templateUrl)
				.then(CreateInstance, TemplateRequestFail);

			return instance;

		}

	})

	.directive('slidepanel', function SlidePanelDirective($document,$timeout) {
		return {
			restrict: 'AE',
			scope: {
				position: '@',
				size: '@',
				dismiss: '&'
			},
			transclude: true,
			link: function(scope, element, attrs, controller, transcludeFn) {

				var dismissFn = scope.dismiss();

				var panel = angular
					.element('<div></div>')
					.addClass('sp-panel')
					.addClass('sp-' + attrs.position)
					.attr('style', getStyle(false))
					.append(transcludeFn());

				$timeout(function(){
					panel.attr('style', getStyle(true));
				}, 100);

				function getStyle(open) {
					switch(attrs.position) {
						case "left": case "right":
							return 'width:' + attrs.size + ';' + attrs.position + ':' + (open ? 0 : '-' + attrs.size);
						case "top": case "bottom":
							return 'height:' + attrs.size + ';' + attrs.position + ':' + (open ? 0 : '-' + attrs.size);
					}
				}

				var dim = angular
					.element('<div></div>')
					.addClass('sp-dim sp-open')
					.on('click', dismissFn);

				var keyDownListener = function(e) {
					switch(e.which){
						case 27:
							dismissFn(e);
							break;
					}
				};

				$document.on('keydown', keyDownListener);

				scope.$on('spClosing', function(){
					panel.attr('style', getStyle(false));
				});

				scope.$on('$destroy', function() {
					$document.off('keydown', keyDownListener);
				});

				element
					.append(panel)
					.append(dim);

			}
		};
	});

}(angular));