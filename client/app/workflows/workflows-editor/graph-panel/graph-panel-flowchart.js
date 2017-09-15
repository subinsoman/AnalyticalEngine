/**
 * Copyright (c) 2015, CodiLime Inc.
 *
 */

'use strict';

/* @ngInject */
function FlowChartBox(GraphPanelRendererService) {
  return {
    restrict: 'E',
    controller: FlowChartBoxController,
    controllerAs: 'flowChartBoxController',
    replace: true,
    scope: true,
    templateUrl: 'app/workflows/workflows-editor/graph-panel/graph-panel-flowchart.html',
    link: (scope, element) => {
      element.on('click', function (event) {
        if (event.target.classList.contains('flowchart-paint-area')) {
          scope.workflow.unselectNode();
          scope.$apply();
        }
      });

      scope.$applyAsync(() => {
        GraphPanelRendererService.rerender();
      });
    }
  };
}

/* @ngInject */
function FlowChartBoxController($scope, $element, $window,
                                WorkflowService, ReportOptionsService, GraphPanelRendererService, GraphNode, Edge) {
  var that = this;
  var internal = {};

  internal.contextMenuState = 'invisible';
  internal.contextMenuPosition = {};

  internal.rawCloseContextMenu = function rawCloseContextMenu () {
    $scope.$broadcast('ContextMenu.CLOSE');
    internal.contextMenuState = 'invisible';
  };

  internal.closeContextMenu = function closeContextMenu () {
    internal.rawCloseContextMenu();
    $scope.$digest();
  };

  internal.contextMenuOpener = function contextMenuOpener (event, data) {
    let portEl = data.reference.canvas;
    let dimensions = portEl.getBoundingClientRect();
    const TOP_SHIFT = 10;

    internal.contextMenuPosition.x = dimensions.left + dimensions.width * jsPlumb.getZoom();
    internal.contextMenuPosition.y = $(portEl).offset().top + TOP_SHIFT;
    internal.contextMenuState = 'visible';
    $scope.$digest();
  };

  internal.isNotInternal = function isNotInternal (event) {
    return event.target && event.target.matches('.context-menu *') === false;
  };

  internal.checkClickAndClose = function checkClickAndClose (event) {
    if (internal.isNotInternal(event)) {
      internal.closeContextMenu();
    }
  };

  internal.handlePortRightClick = function handlePortRightClick (event, data) {
    let port = data.reference;
    let nodeId = port.getParameter('nodeId');
    let currentNode = WorkflowService.getWorkflow().getNodes()[nodeId];

    ReportOptionsService.setCurrentPort(port);
    ReportOptionsService.setCurrentNode(currentNode);
    ReportOptionsService.clearReportOptions();
    ReportOptionsService.updateReportOptions();

    internal.contextMenuOpener.apply(internal, arguments);
  };

  that.getContextMenuState = function getContextMenuState () {
    return internal.contextMenuState;
  };

  that.getContextMenuPositionY = function getContextMenuPositionY() {
    return internal.contextMenuPosition.y;
  };

  that.getContextMenuPositionX = function getContextMenuPositionX() {
    return internal.contextMenuPosition.x;
  };

  that.getPositionY = function getPositionY() {
    return $element[0].offsetTop;
  };

  that.getPositionX = function getPositionX() {
    return $element[0].getBoundingClientRect().left;
  };

  that.getReportOptions = function getReportOptions() {
    return ReportOptionsService.getReportOptions();
  };

  $scope.$on(GraphNode.MOUSEDOWN, internal.closeContextMenu);
  $scope.$on(Edge.DRAG, internal.closeContextMenu);
  $scope.$on('InputPoint.CLICK', internal.closeContextMenu);
  $scope.$on('OutputPort.LEFT_CLICK', internal.closeContextMenu);
  $scope.$on('OutputPort.RIGHT_CLICK', internal.handlePortRightClick);
  $scope.$on('Keyboard.KEY_PRESSED_ESC', internal.closeContextMenu);

  $window.addEventListener('mousedown', internal.checkClickAndClose);
  $window.addEventListener('blur', internal.closeContextMenu);

  $scope.$on('ZOOM.ZOOM_PERFORMED', (event, data) => {
    GraphPanelRendererService.setZoom(data.zoomRatio);
    internal.rawCloseContextMenu();
  });

  $scope.$on('Drop.EXACT', (event, dropEvent, droppedElement, droppedElementType) => {
    if (droppedElementType === 'graphNode') {
      let data = {};

      data.dropEvent = dropEvent;
      data.elementId = dropEvent.dataTransfer.getData('elementId');
      data.target = $element[0];

      $scope.$emit('FlowChartBox.ELEMENT_DROPPED', data);
    }
  });

  $scope.$on('$destroy', () => {
    $window.removeEventListener('mousedown', internal.checkClickAndClose);
    $window.removeEventListener('blur', internal.closeContextMenu);
  });
}

exports.inject = function (module) {
  module.directive('flowChartBox', FlowChartBox);
};
