/**
 * Scroll-triggered chart entrances (Swiss-style motion).
 * IntersectionObserver threshold 0.15, one-shot via data-animated.
 * Chart.js: native animation API with split easings (transform-like props vs opacity).
 */
(function() {
  'use strict';

  var DURATION_MS = 320;
  var STAGGER_MS = 40;
  var SCATTER_MAX_STAGGER_MS = 3200;
  /* Scatter-specific: fixed stagger BUDGET (not per-point), so every point arrives uniformly
     regardless of how many there are. Keeps the entrance snappy on dense correlation plots. */
  var SCATTER_TOTAL_STAGGER_MS = 400;
  var SCATTER_DURATION_MS = 180;

  /** CSS cubic-bezier(0.34, 1.56, 0.64, 1) — y(t) for input time x in [0,1] */
  function cubicBezierXY(x1, y1, x2, y2) {
    function bx(t) {
      return 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
    }
    function by(t) {
      return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
    }
    return function(x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var lo = 0;
      var hi = 1;
      var t = 0.5;
      for (var i = 0; i < 14; i++) {
        t = (lo + hi) / 2;
        if (bx(t) < x) lo = t; else hi = t;
      }
      t = (lo + hi) / 2;
      return by(t);
    };
  }

  var elasticBezier = cubicBezierXY(0.34, 1.56, 0.64, 1);
  var CHARTJS_ELASTIC_EASING = 'easeOutBack';
  var CHARTJS_OPACITY_EASING = 'easeInOutQuad';

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function staggerDelay(ctx) {
    if (ctx.type === 'data' && ctx.mode === 'default') {
      return Math.min(ctx.dataIndex * STAGGER_MS, SCATTER_MAX_STAGGER_MS);
    }
    return 0;
  }

  function scatterStaggerDelay(ctx) {
    if (ctx.type !== 'data' || ctx.mode !== 'default') return 0;
    var ds = ctx.chart && ctx.chart.data && ctx.chart.data.datasets && ctx.chart.data.datasets[0] && ctx.chart.data.datasets[0].data;
    var total = (ds && ds.length) || 1;
    if (total <= 1) return 0;
    /* Linear distribution across a fixed budget: every point gets an equal slice,
       so a 5-point plot and a 5000-point plot both finish kicking off in SCATTER_TOTAL_STAGGER_MS. */
    return (ctx.dataIndex / (total - 1)) * SCATTER_TOTAL_STAGGER_MS;
  }

  window.CHART_ANIMATION = {
    bar: {
      animation: {
        duration: DURATION_MS,
        delay: staggerDelay,
        easing: CHARTJS_ELASTIC_EASING
      },
      animations: {
        y: {
          type: 'number',
          properties: ['y', 'height'],
          easing: CHARTJS_ELASTIC_EASING,
          from: function(ctx) {
            if (ctx.type === 'data' && ctx.mode === 'default' && ctx.chart && ctx.chart.scales && ctx.chart.scales.y) {
              return ctx.chart.scales.y.getPixelForValue(0);
            }
          }
        },
        opacity: {
          type: 'number',
          properties: ['opacity'],
          easing: CHARTJS_OPACITY_EASING,
          from: 0
        }
      }
    },
    horizontalBar: {
      animation: {
        duration: DURATION_MS,
        delay: staggerDelay,
        easing: CHARTJS_ELASTIC_EASING
      },
      animations: {
        x: {
          type: 'number',
          properties: ['x'],
          easing: CHARTJS_ELASTIC_EASING,
          from: function(ctx) {
            if (ctx.type === 'data' && ctx.mode === 'default' && ctx.chart && ctx.chart.scales && ctx.chart.scales.x) {
              return ctx.chart.scales.x.getPixelForValue(0);
            }
          }
        },
        opacity: {
          type: 'number',
          properties: ['opacity'],
          easing: CHARTJS_OPACITY_EASING,
          from: 0
        }
      }
    },
    line: {
      animation: {
        duration: DURATION_MS,
        delay: staggerDelay,
        easing: CHARTJS_ELASTIC_EASING
      },
      animations: {
        y: {
          type: 'number',
          properties: ['y'],
          easing: CHARTJS_ELASTIC_EASING,
          from: function(ctx) {
            if (ctx.type === 'data' && ctx.mode === 'default' && ctx.chart && ctx.chart.scales && ctx.chart.scales.y) {
              return ctx.chart.scales.y.getPixelForValue(0);
            }
          }
        },
        opacity: {
          type: 'number',
          properties: ['opacity'],
          easing: CHARTJS_OPACITY_EASING,
          from: 0
        }
      }
    },
    pie: {
      animation: {
        duration: DURATION_MS,
        delay: staggerDelay,
        easing: CHARTJS_ELASTIC_EASING
      },
      animations: {
        scale: {
          easing: CHARTJS_ELASTIC_EASING,
          from: 0.6
        },
        opacity: {
          easing: CHARTJS_OPACITY_EASING,
          from: 0
        }
      }
    },
    venn: {
      animation: {
        duration: DURATION_MS,
        delay: staggerDelay,
        easing: CHARTJS_ELASTIC_EASING
      },
      animations: {
        scale: {
          easing: CHARTJS_ELASTIC_EASING,
          from: 0.6
        },
        opacity: {
          easing: CHARTJS_OPACITY_EASING,
          from: 0
        }
      }
    },
    bubble: {
      animation: {
        duration: DURATION_MS,
        delay: staggerDelay,
        easing: CHARTJS_ELASTIC_EASING
      },
      animations: {
        radius: {
          type: 'number',
          properties: ['radius'],
          easing: CHARTJS_ELASTIC_EASING,
          from: 0
        },
        opacity: {
          type: 'number',
          properties: ['opacity'],
          easing: CHARTJS_OPACITY_EASING,
          from: 0
        }
      }
    },
    scatter: {
      animation: {
        duration: SCATTER_DURATION_MS,
        delay: scatterStaggerDelay,
        easing: 'easeOutQuad'
      },
      animations: {
        radius: {
          type: 'number',
          properties: ['radius'],
          easing: 'easeOutQuad',
          from: 0
        },
        opacity: {
          type: 'number',
          properties: ['opacity'],
          easing: CHARTJS_OPACITY_EASING,
          from: 0
        }
      }
    }
  };

  window.CHART_ENTRANCE_DURATION_MS = DURATION_MS;
  window.CHART_ENTRANCE_STAGGER_MS = STAGGER_MS;
  window.chartEasingElastic = elasticBezier;
  window.chartEasingOpacity = easeInOutQuad;

  /**
   * Plotly Sankey (SVG): staggered opacity on link paths — closest to “flow” without layout animation.
   */
  window.animatePlotlySankeyEntrance = function(gdDiv) {
    if (!gdDiv) return;
    var svg = gdDiv.querySelector('svg');
    if (!svg) return;
    var paths = svg.querySelectorAll('path');
    if (!paths.length) return;
    var maxDelay = 0;
    paths.forEach(function(p, i) {
      var d = Math.min(i * STAGGER_MS, 2000);
      maxDelay = Math.max(maxDelay, d);
      p.style.willChange = 'opacity';
      p.style.opacity = '0';
      p.style.transition = 'opacity ' + DURATION_MS + 'ms ease-in-out ' + d + 'ms';
    });
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        paths.forEach(function(p) {
          p.style.opacity = '1';
        });
      });
    });
    setTimeout(function() {
      paths.forEach(function(p) {
        p.style.willChange = '';
      });
    }, maxDelay + DURATION_MS + 80);
  };

  var chartObserver = null;

  function getContainer(id) {
    var el = document.getElementById(id);
    if (!el) return null;
    return el.classList && el.classList.contains('chart-container') ? el : (el.closest && el.closest('.chart-container'));
  }

  window.whenChartInView = function(idOrElement, createFn) {
    var container = typeof idOrElement === 'string' ? getContainer(idOrElement) : idOrElement;
    if (!container || typeof createFn !== 'function') return;
    if (container.hasAttribute('data-animated')) return;

    container.classList.add('chart-enter');
    container.style.willChange = 'transform, opacity';

    if (!chartObserver) {
      chartObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          var c = entry.target;
          if (c.hasAttribute('data-animated')) return;
          c.setAttribute('data-animated', '');
          c.classList.remove('chart-enter');
          c.classList.add('chart-enter-active');
          var fn = c._chartCreateFn;
          if (fn) {
            fn();
            c._chartCreateFn = null;
          }
          chartObserver.unobserve(c);
          var dur = typeof window.CHART_ENTRANCE_DURATION_MS === 'number' ? window.CHART_ENTRANCE_DURATION_MS : 320;
          function cleanup() {
            c.style.willChange = '';
            c.classList.add('will-change-cleanup');
          }
          c.addEventListener('transitionend', function onEnd(ev) {
            if (ev.target !== c) return;
            if (ev.propertyName !== 'opacity' && ev.propertyName !== 'transform') return;
            c.removeEventListener('transitionend', onEnd);
            cleanup();
          });
          setTimeout(cleanup, dur + 80);
        });
      }, { threshold: 0.15 });
    }

    container._chartCreateFn = createFn;
    chartObserver.observe(container);
  };
})();
