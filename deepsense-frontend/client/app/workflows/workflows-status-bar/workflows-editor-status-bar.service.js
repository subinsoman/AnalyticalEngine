'use strict';

/* ngInject */
function WorkflowStatusBarService($rootScope, config, version, WorkflowService, SessionStatus, UserService) {

  const service = this;

  service.getMenuItems = getMenuItems;

  const currentWorkflow = WorkflowService.getCurrentWorkflow();
  const userId = UserService.getSeahorseUser().id;
  const isOwner = currentWorkflow.owner.id === userId;
  const smallLabel = isOwner ? null : 'Owner only';

  const menuItems = {
    clear: {
      label: 'Clear',
      smallLabel: smallLabel,
      icon: 'fa-trash-o',
      callFunction: () => $rootScope.$broadcast('StatusBar.CLEAR_CLICK')
    },
    documentation: {
      label: 'Documentation',
      icon: 'fa-book',
      href: config.docsHost + '/docs/' + version.getDocsVersion() + '/index.html',
      target: '_blank'
    },
    export: {
      label: 'Export',
      icon: 'fa-angle-double-down',
      callFunction: () => $rootScope.$broadcast('StatusBar.EXPORT_CLICK')
    },
    run: {
      label: 'Run',
      smallLabel: smallLabel,
      icon: 'fa-play',
      callFunction: () => $rootScope.$broadcast('StatusBar.RUN')
    },
    startExecutor: {
      label: 'Start editing',
      smallLabel: smallLabel,
      icon: 'fa fa-pencil',
      callFunction: () => $rootScope.$emit('StatusBar.START_EXECUTOR')
    },
    startingExecutor: {
      label: 'Start executor...',
      icon: 'fa-cog',
      additionalClass: 'menu-item-disabled',
      additionalIconClass: 'fa-spin'
    },
    stopExecutor: {
      label: 'Stop executor',
      icon: 'fa-ban',
      callFunction: () => $rootScope.$emit('StatusBar.STOP_EXECUTOR')
    },
    abort: {
      label: 'Abort',
      icon: 'fa-ban',
      callFunction: () => $rootScope.$broadcast('StatusBar.ABORT')
    },
    aborting: {
      label: 'Aborting...',
      icon: 'fa-ban',
      color: '#216477',
      additionalClass: 'menu-item-disabled'
    },
    closeInnerWorkflow: {
      label: 'Close inner workflow',
      icon: 'fa-ban',
      color: '#216477',
      callFunction: () => $rootScope.$broadcast('StatusBar.CLOSE-INNER-WORKFLOW')
    }
  };

  menuItems.disabledStartExecutor = angular.copy(menuItems.startExecutor);
  menuItems.disabledStartExecutor.additionalClass = 'menu-item-disabled';

  menuItems.disabledClear = angular.copy(menuItems.clear);
  menuItems.disabledClear.additionalClass = 'menu-item-disabled';

  menuItems.disabledExport = angular.copy(menuItems.export);
  menuItems.disabledExport.additionalClass = 'menu-item-disabled';

  menuItems.disabledRun = angular.copy(menuItems.run);
  menuItems.disabledRun.additionalClass = 'menu-item-disabled';

  const _menuItemViews = {
    editorWithExecutor: [menuItems.export, menuItems.stopExecutor, menuItems.clear, menuItems.run, menuItems.documentation],
    editorWithoutReadyExecutor: [menuItems.export, menuItems.startingExecutor,  menuItems.disabledClear, menuItems.disabledRun, menuItems.documentation],
    editorWithoutExecutorForOwner: [menuItems.export, menuItems.startExecutor, menuItems.disabledClear, menuItems.disabledRun, menuItems.documentation],
    editorWithoutExecutor: [menuItems.export, menuItems.disabledStartExecutor, menuItems.disabledClear, menuItems.disabledRun, menuItems.documentation],
    running: [menuItems.disabledExport, menuItems.disabledClear, menuItems.abort, menuItems.documentation],
    aborting: [menuItems.disabledExport, menuItems.disabledClear,  menuItems.aborting,  menuItems.documentation],
    editInnerWorkflow: [menuItems.documentation, menuItems.closeInnerWorkflow]
  };

  function getMenuItems(workflow) {
    let view = _getView(workflow);
    return _menuItemViews[view];
  }

  function _getView(workflow) {
    // TODO Refactor this code.
    switch (workflow.workflowType) {
      case 'root':
        switch (workflow.workflowStatus) {
          case 'editor':
            switch (workflow.sessionStatus) {
              case SessionStatus.NOT_RUNNING:
                return isOwner ?
                  'editorWithoutExecutorForOwner'
                  : 'editorWithoutExecutor';
                return 'editorWithoutExecutor';
              case SessionStatus.STARTING:
              case SessionStatus.RUNNING:
                return 'editorWithoutReadyExecutor';
              case SessionStatus.RUNNING_AND_READY:
                return 'editorWithExecutor';
              default:
                throw `Unsupported session status: ${workflow.sessionStatus}`;
            }
          case 'aborting':
          case 'running':
            return workflow.workflowStatus;
          default:
            throw `Unsupported workflow status: ${workflow.workflowStatus}`;
        }
      case 'inner':
        if (workflow.workflowStatus === 'editor') {
          return 'editInnerWorkflow';
        } else {
          throw 'Cannot run inner workflow';
        }
    }
  }

  return service;
}

exports.inject = function (module) {
  module.service('WorkflowStatusBarService', WorkflowStatusBarService);
};
