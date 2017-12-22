import Barba from 'barba.js';
import {TimelineMax} from 'gsap';
Barba.Pjax.start();

var lastClicked;

Barba.Dispatcher.on('linkClicked',function(el) {
  lastClicked = el;
});

var ExpandTransition = Barba.BaseTransition.extend({
  start: function() {
    Promise
      .all([this.newContainerLoading, this.zoom()])
      .then(this.showNewPage.bind(this));
  },
  
  zoom: function() {
    var deferred = Barba.Utils.deferred();

    let tl = new TimelineMax();
    let left = lastClicked.getBoundingClientRect().left;
    let cloned = lastClicked.cloneNode(true);

    let nextAll = $(lastClicked).nextAll();
    let prevAll = $(lastClicked).prevAll();

    cloned.classList.add('is-cloned');
    this.oldContainer.appendChild(cloned);
    tl.set(cloned,{x:left});

    let screenWidth = $(window).width();
    let bg = $(cloned).find('.item__bg');

    tl.to(cloned,1,{x:0,width: screenWidth,onComplete: function() {
      deferred.resolve();
    }},0);
    
    let prevAllLeft = prevAll[0].getBoundingClientRect().left;
    tl.to(prevAll,1,{
      x: -(screenWidth/6 + prevAllLeft)
    },0);

    let nextAllLeft = screenWidth - nextAll[0].getBoundingClientRect().left;
    tl.to(nextAll,1,{
      x: nextAllLeft
    },0);

    tl.to(bg,1,{x:0},0);
    return deferred.promise;
  },
  
  showNewPage: function() {
    this.done();
  }
});

var BackTransition = Barba.BaseTransition.extend({
  start: function() {
    Promise
      .all([this.newContainerLoading, this.zoom()])
      .then(this.showNewPage.bind(this));
  },
  
  zoom: function() {
    var deferred = Barba.Utils.deferred();
    deferred.resolve();
    return deferred.promise;
  },
  
  showNewPage: function() {
    this.done();
  }
});
  
Barba.Pjax.getTransition = function() {
  var transitionObj = ExpandTransition;
  
  if(Barba.HistoryManager.prevStatus().namespace === 'Single') {
    transitionObj = BackTransition;
  }
  return transitionObj;
};
