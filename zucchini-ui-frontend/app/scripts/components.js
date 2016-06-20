(function (angular) {
  'use strict';


  var ColumnManager = function (definition) {

    // Maximum size : Bootstrap max size
    this.maxSize = 12;

    this.definition = definition;
    this.selectedColumnNames = _.keys(definition);

    this.removeColumnByName = function (name) {
      _.remove(this.selectedColumnNames, function (value) {
        return value === name;
      });
    };

    this.count = function () {
      return this.selectedColumnNames.length;
    };

    this.isDisplayable = function (name) {
      var index = this.selectedColumnNames.findIndex(function (value) {
        return value === name;
      });
      return index !== -1;
    };

    this.getDisplaySize = function (name) {
      var size = this.definition[name];
      if (_.isNumber(size)) {
        return size;
      }
      return this.maxSize - this.getTotalDisplaySize();
    };

    this.getTotalDisplaySize = function () {
      // Select columns
      var selectedSizes = _.pick(this.definition, this.selectedColumnNames);

      // Compute current size, based on selected columns
      var currentSize = 0;
      _.forIn(selectedSizes, function (value) {
        if (_.isNumber(value)) {
          currentSize += value;
        }
      });

      return currentSize;
    };

  };


  angular.module('zucchini-ui-frontend')
    .component('tcStatus', {
      templateUrl: 'views/tc-status.html',
      bindings: {
        status: '<'
      }
    })
    .component('tcTags', {
      templateUrl: 'views/tc-tags.html',
      bindings: {
        tags: '<',
        testRunId: '<'
      }
    })
    .component('tcScenarioPieChart', {
      templateUrl: 'views/tc-scenario-pie-chart.html',
      bindings: {
        stats: '<',
        kind: '@'
      },
      controller: function ($scope) {

        $scope.$watchGroup(['$ctrl.stats', '$ctrl.kind'], function () {
          if (_.isUndefined(this.stats) || _.isUndefined(this.kind)) {
            delete this.series;
          } else {

            var series = [
              {
                value: this.stats[this.kind].passed,
                className: 'chart-progress-passed'
              },
              {
                value: this.stats[this.kind].pending,
                className: 'chart-progress-pending'
              },
              {
                value: this.stats[this.kind].failed,
                className: 'chart-progress-failed'
              },
              {
                value: this.stats[this.kind].notRun,
                className: 'chart-progress-not-run'
              },
              {
                value: this.stats.all.count - this.stats[this.kind].count,
                className: 'chart-progress-others'
              }
            ];

            series = series.filter(function (serie) {
              return serie.value > 0;
            });

            this.series = {
              series: series
            };

          }
        }.bind(this));

      }
    })
    .component('tcStatsDashboard', {
      templateUrl: 'views/tc-stats-dashboard.html',
      bindings: {
        stats: '<'
      }
    })
    .component('tcScenarioList', {
      templateUrl: 'views/tc-scenario-list.html',
      bindings: {
        scenarii: '<',
        displayFeature: '@'
      },
      controller: function (scenarioStoredFilters) {

        this.columns = new ColumnManager({
          feature: 4,
          scenario: null,
          status: 1,
          reviewed: 1
        });

        this.selectedScenarii = [];

        this.$onInit = function () {
          // Configure columns
          if (!this.displayFeature) {
            this.columns.removeColumnByName('feature');
          }

          // Get filters
          this.filters = scenarioStoredFilters.get();
        };

        this.$onChanges = function (changes) {
          // Init selected scenarii to bound scenarii
          if (changes.scenarii && this.scenarii) {
            this.updateScenariiSelection();
          }
        };

        this.updateScenariiSelection = function () {
          this.selectedScenarii = this.scenarii.filter(this.isScenarioDisplayable);
        };

        this.onFilterChange = function () {
          scenarioStoredFilters.save(this.filters);
          this.updateScenariiSelection();
        };

        this.isScenarioDisplayable = function (scenario) {
          return this.isScenarioStatusDisplayable(scenario) && this.isScenarioReviewedStateDisplayable(scenario);
        }.bind(this);

        this.isScenarioStatusDisplayable = function (scenario) {
          switch (scenario.status) {
            case 'PASSED':
              return this.filters.passed;
            case 'FAILED':
              return this.filters.failed;
            case 'PENDING':
              return this.filters.pending;
            case 'NOT_RUN':
              return this.filters.notRun;
            default:
              return true;
          }
        };

        this.isScenarioReviewedStateDisplayable = function (scenario) {
          var selected = false;
          if (this.filters.reviewed) {
            selected = selected || scenario.reviewed;
          }
          if (this.filters.notReviewed) {
            selected = selected || !scenario.reviewed;
          }
          return selected;
        };

      }
    })
    .factory('scenarioStoredFilters', function (ObjectBrowserStorage) {
      return ObjectBrowserStorage.getItem('scenarioFilters', function () {
        return {
          passed: true,
          failed: true,
          pending: true,
          notRun: true,
          reviewed: true,
          notReviewed: true
        };
      });
    })
    .component('tcFeatureList', {
      templateUrl: 'views/tc-feature-list.html',
      bindings: {
        features: '<'
      },
      controller: function (featureStoredFilters) {

        this.selectedFeatures = [];

        this.$onInit = function () {
          // Init filters
          this.filters = featureStoredFilters.get();
        };

        this.$onChanges = function (changes) {
          // Init selected features to bound features
          if (changes.features && this.features) {
            this.updateFeatureSelection();
          }
        };

        this.updateFeatureSelection = function () {
          this.selectedFeatures = this.features.filter(this.isFeatureDisplayable.bind(this));
        };

        this.onFilterChange = function () {
          featureStoredFilters.save(this.filters);
          this.updateFeatureSelection();
        };

        this.onGroupsSelected = function (groups) {
          this.filters.selectedGroups = groups;
          this.onFilterChange();
        };

        this.onGroupsCleared = function () {
          this.filters.selectedGroups = null;
          this.onFilterChange();
        };

        this.isFeatureDisplayable = function (feature) {
          return this.isFeatureStatusDisplayable(feature) && this.isFeatureReviewedStateDisplayable(feature) && this.isFeatureInSelectedGroup(feature);
        };

        this.isFeatureStatusDisplayable = function (feature) {
          switch (feature.status) {
            case 'PASSED':
              return this.filters.passed;
            case 'FAILED':
              return this.filters.failed;
            case 'PARTIAL':
              return this.filters.partial;
            case 'NOT_RUN':
              return this.filters.notRun;
            default:
              return true;
          }
        };

        this.isFeatureReviewedStateDisplayable = function (feature) {
          var selected = false;
          if (this.filters.reviewed) {
            selected = selected || (feature.stats.reviewed.count === feature.stats.all.count);
          }
          if (this.filters.notReviewed) {
            selected = selected || (feature.stats.reviewed.count !== feature.stats.all.count);
          }
          return selected;
        };

        this.isFeatureInSelectedGroup = function (feature) {
          if (this.filters.selectedGroups) {
            return this.filters.selectedGroups.indexOf(feature.group || '') !== -1;
          }
          return true;
        };

      }
    })
    .component('tcFeatureGroupSelection', {
      templateUrl: 'views/tc-feature-group-selection.html',
      bindings: {
        features: '<',
        selectedGroups: '<',
        onSelect: '&',
        onClear: '&'
      },
      controller: function () {

        this.groups = [];
        this.selection = {};

        this.$onChanges = function (changes) {
          // Init group list from features
          if (changes.features && this.features) {
            this.updateGroups();
          }

          // Init selection
          if ((changes.features || changes.selectedGroups)) {
            this.updateSelection();
          }
        };

        this.updateGroups = function () {
          var groups = this.features
            .map(function (feature) {
              return feature.group || '';
            })
            .sort();

          this.groups = _.sortedUniq(groups);
        };

        this.updateSelection = function () {
          var selection = {};

          if (this.selectedGroups) {
            this.groups.forEach(function (group) {
              selection[group] = false;
            });
            this.selectedGroups.forEach(function (group) {
              selection[group] = true;
            });
          } else if (this.groups) {
            this.groups.forEach(function (group) {
              selection[group] = true;
            });
          }

          this.selection = selection;
        };

        this.isGroupSelected = function (group) {
          return this.selection && this.selection.indexOf(group) !== -1;
        };

        this.select = function () {
          var selectedGroups = _.toPairs(this.selection)
            .filter(function (pair) {
              return pair[1] === true;
            })
            .map(function (pair) {
              return pair[0];
            });
            this.onSelect({ groups: selectedGroups });
        };

      }
    })
    .factory('featureStoredFilters', function (ObjectBrowserStorage) {
      return ObjectBrowserStorage.getItem('featureFilters', function () {
        return {
          passed: true,
          failed: true,
          partial: true,
          notRun: true,
          reviewed: true,
          notReviewed: true,
          selectedGroups: null
        };
      });
    })
    .component('tcPieChart', {
      templateUrl: 'views/tc-feature-list.html',
      bindings: {
        data: '<',
        total: '<'
      },
      controller: function ($element) {

        this.chart = null;

        this.$postLink = function () {
          // Attach chart to current element
          this.chart = new Chartist.Pie($element[0]);
          this.updateChart();
        };

        this.$onChanges = function (changes) {
          // Init selected features to bound features
          if ((changes.data || changes.total) && this.data && _.isNumber(this.total)) {
            this.updateChart();
          }
        };

        this.$onDestroy = function () {
          // Release chart resources on directive destroy
          this.chart.detach();
        };

        this.updateChart = function () {
          if (this.chart) {
            this.chart.update(this.data, {
              total: this.total,
              donut: true,
            }, true);
          }
        };

    }
  });

})(angular);
