var myApp = angular.module('myApp', []);

var months = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
    "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM", "12 AM"];

var config = {
    step: {
        hours: 1
    },
    range: {
        min: { hours: 1 },
        max: { hours: 24 }
    },
    bounds: {
        min: new Date(2013, 0, 1, 0, 0, 0),
        max: new Date(2013, 0, 1, 24, 0, 0)
    },
    defaultValues: {
        min: new Date(2013, 0, 1, 2, 0, 0),
        max: new Date(2013, 0, 1, 6, 0, 0)
    }
}

var sliderLeftHandleStyle = "ui-rangeSlider-handle ui-rangeSlider-leftHandle";
var sliderRightHandleStyle = "ui-rangeSlider-handle ui-rangeSlider-rightHandle";

function TwoDigits(val) {
    if (val < 10) {
        return "0" + val;
    }
    return val;
}

function getHoursDiff(min, max) {
    return Math.abs(min - max) / 36e5;
}

function getSliderMinValue(elementId) {
    return $("#" + elementId + ">.sliderHolder").dateRangeSlider("min");
}

function getSliderMaxValue(elementId) {
    return $("#" + elementId + ">.sliderHolder").dateRangeSlider("max");
}

myApp.controller('MainCtrl', ['$scope', '$timeout', function ($scope, $timeout) {

    $scope.lastHowManyStepsScrolled = null;
    $scope.lastSliderMinValue = null;
    $scope.lastSliderMaxValue = null;
    $scope.slider1Min = config.defaultValues.min;
    $scope.slider2Min = config.defaultValues.min;
    $scope.slider3Min = config.defaultValues.min;
    $scope.slider1Max = config.defaultValues.max;
    $scope.slider2Max = config.defaultValues.max;
    $scope.slider3Max = config.defaultValues.max;

    $scope.$on('rangeSlider1.update', function (e, data) {
        // FOR SLIDER #1 only....
        var sliderMin = getSliderMinValue("slider1");
        var sliderMax = getSliderMaxValue("slider1");
        $scope.slider1Min = sliderMin;
        $scope.slider1Max = sliderMax;
    });

    $scope.$on('rangeSlider2.update', function (e, data) {
        // FOR SLIDER #2 only....
        var sliderMin = getSliderMinValue("slider2");
        var sliderMax = getSliderMaxValue("slider2");
        $scope.slider2Min = sliderMin;
        $scope.slider2Max = sliderMax;
    });

    $scope.$on('rangeSlider3.update', function (e, data) {
        // FOR SLIDER #3 only....

        var sliderMin = getSliderMinValue("slider3");
        var sliderMax = getSliderMaxValue("slider3");

        $scope.slider3Min = sliderMin;
        $scope.slider3Max = sliderMax;

        var vieweableZone = $("#slider3")[0];
        var fullBox = $('#slider3 .sliderHolder')[0];
        var handle = $('#slider3 .ui-rangeSlider-bar')[0];

        // maximum scroll left possible with given dimensions
        var maxScrollLeft = vieweableZone.scrollWidth - vieweableZone.clientWidth;
        // scroll space acquired by handle
        var handleWidth = ((maxScrollLeft / 24) * getHoursDiff(sliderMin, sliderMax));
        // starting from 0 how many steps already scrolled
        var howManyStepsScrolled = getHoursDiff(config.bounds.min, sliderMin);
        // total steps involved
        var totalSteps = 24 - handleWidth; // we show 24h in total
        // how many pixels should the slider scroll
        var scrollValue = ((maxScrollLeft / 24) * howManyStepsScrolled);

        if (sliderMin !== sliderMax) {

            if (($scope.lastSliderMinValue !== sliderMin || $scope.lastSliderMaxValue !== sliderMax)
                && $scope.lastHowManyStepsScrolled !== howManyStepsScrolled) {

                var scrollLeft = 0;

                if (howManyStepsScrolled < $scope.lastHowManyStepsScrolled) {
                    // do scroll left
                    scrollLeft = scrollValue;
                } else {
                    // do scroll right
                    scrollLeft = scrollValue + handleWidth;
                }

                vieweableZone.scrollLeft = scrollLeft;

                $scope.lastHowManyStepsScrolled = howManyStepsScrolled;
                $scope.lastSliderMinValue = sliderMin;
                $scope.lastSliderMaxValue = sliderMax;
            }
        }

    });
}]);

myApp.directive('jqRangeSlider', [function () {
    return {
        restrict: "A",
        scope: {},
        replace: true,
        link: function (scope, element, attrs) {
            var opts = (angular.isDefined(attrs.jqRangeSlider)) ? scope.$eval(attrs.jqRangeSlider) : {};
            if (opts === undefined || opts === null) {
                opts = {};
            }
            opts.step = config.step;
            opts.range = config.range;
            opts.bounds = config.bounds;
            opts.defaultValues = config.defaultValues;
            opts.formatter = function (value) {
                var hours = value.getHours(),
                    minutes = value.getMinutes();
                return value.toLocaleTimeString(navigator.language, {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            };
            opts.scales = [{
                first: function (value) {
                    return value;
                },
                end: function (value) {
                    return value;
                },
                next: function (value) {
                    var next = new Date(value);
                    return new Date(next.setHours(value.getHours() + 1));
                },
                label: function (value) {
                    return months[value.getHours()];
                },
                format: function (tickContainer, tickStart, tickEnd) {
                    tickContainer.addClass("sliderLabel");
                }
            }];
            jQuery(element).dateRangeSlider(opts);
            switch (opts.wrapperSelector) {
                case '#slider1':
                    $('#slider1').bind('valuesChanged', function (e, data) {
                        scope.$apply(function () {
                            scope.$emit('rangeSlider1.update', [e, data]);
                        });
                    });
                    $('#slider1').dragscrollable({
                        acceptPropagatedEvent: true,
                        preventDefault: true,
                        excludedAreas: [
                            "ui-rangeSlider-bar",
                            "ui-rangeSlider-handle ui-rangeSlider-rightHandle",
                            "ui-rangeSlider-handle ui-rangeSlider-leftHandle"
                        ]
                    });
                    break;
                case '#slider2':
                    $('#slider2').bind('valuesChanged', function (e, data) {
                        scope.$apply(function () {
                            scope.$emit('rangeSlider2.update', [e, data]);
                        });
                    });
                    $('#slider2').dragscrollable({
                        dragSelector: '>:first, .ui-rangeSlider-bar',
                        acceptPropagatedEvent: true,
                        preventDefault: true,
                        allowY: false,
                        excludedAreas: [
                            "ui-rangeSlider-handle ui-rangeSlider-rightHandle",
                            "ui-rangeSlider-handle ui-rangeSlider-leftHandle"
                        ]
                    });
                    // Overriden code - to prevent dragging of slider using slider handle
                    $.ui.rangeSliderDraggable.prototype._mouseStart = function (event) {
                        var that = this;
                        var triggerMouseStart = function () {
                            that._cache();
                            that.cache.click = {
                                left: event.pageX,
                                top: event.pageY
                            };
                            that.cache.initialOffset = that.element.offset();
                            that._triggerMouseEvent("mousestart");
                            return true;
                        };
                        if (event.target.parentElement.parentElement.parentElement.className === "sliderInnerWrapper") {
                            if (event.target.className !== "ui-rangeSlider-bar") {
                                triggerMouseStart();
                            } else {
                                that._cache();                                    
                                return true;                                                                                    
                            }
                        } else {
                            triggerMouseStart();
                        }
                    };
                    break;
                case '#slider3':
                    $('#slider3').bind('valuesChanged', function (e, data) {
                        scope.$apply(function () {
                            scope.$emit('rangeSlider3.update', [e, data]);
                        });
                    });
                    break;
                default:
                    break;
            }
        }
    }
}]);
