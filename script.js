/* =========================================================
   BIRTHDAY CARD — SCRIPT
   Scene/state navigation for the interactive birthday card.
   No frameworks, no build step — just DOM + CSS classes.
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. IMAGE CONFIG
     Replace these files inside /assets with real photos.
     Filenames match the ones listed in the project README.
     --------------------------------------------------------- */
  var images = {
    child1: "assets/first%20image.png",
    child2: "assets/second%20iamge.png",
    child3: "assets/third%20image.png",
    birthday: "assets/fifth%20image.png",
    memory1: "assets/memory1.jpg",
    memory2: "assets/memory2.jpg",
    memory3: "assets/memory3.jpg",
    memory4: "assets/memory4.jpg"
  };

  /* Which photo shows in which scene. Change freely — every
     scene just looks up its key here, so re-pointing a scene
     at a different photo is a one-line edit. */
  var sceneImageMap = {
    intro: images.child1,
    no: images.child2,
    excitement: images.child3,
    birthday: images.birthday,
    wish: images.child1,
    memory1: images.memory1,
    memory2: images.memory2,
    memory3: images.memory3,
    memory4: images.memory4,
    letter: images.child2,
    final: images.child3
  };

  var PLACEHOLDER_IMG = "assets/placeholder.svg";

  /* ---------------------------------------------------------
     2. GIFT -> SCENE MAPPING
     Change these numbers/strings to rewire which gift opens
     which part of the story.
     --------------------------------------------------------- */
  var GIFT_DESTINATIONS = {
    1: "birthday",   // gift 1 -> birthday -> wish -> back to gifts
    2: "memories",   // gift 2 -> memories -> back to gifts
    3: "letter"       // gift 3 -> letter -> final (closes the card)
  };

  var giftsOpened = { 1: false, 2: false, 3: false };

  /* Dot 0: greeting, 1: gift hub, 2: inside a gift, 3: closing */
  var DOT_STEP_BY_SCENE = {
    intro: 0, no: 0, excitement: 0,
    gifts: 1,
    birthday: 2, wish: 2, memories: 2,
    letter: 3, final: 3
  };

  var state = { current: null };

  /* ---------------------------------------------------------
     3. DOM READY
     --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    applySceneImages();
    setupImageFallbacks();
    wireNavigation();
    setupLiveRegion();
    forceButtonsClickable();
    showScene("intro", { immediate: true });
  });

  /* Force all buttons to remain clickable - run after animations complete */
  function forceButtonsClickable() {
    // Run immediately
    makeButtonsClickable();
    
    // Run again after 2 seconds (after all animations complete)
    setTimeout(makeButtonsClickable, 2000);
    
    // Run every time a scene changes
    var observer = new MutationObserver(function() {
      setTimeout(makeButtonsClickable, 100);
    });
    observer.observe(document.getElementById('cardInner'), {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'style']
    });
  }

  function makeButtonsClickable() {
    var buttons = document.querySelectorAll('button, .primary-button, .secondary-button, .retry-button, .arrow-button, .gift-button, .heart-button, .scroll-btn, .replay-link, a.contact-badge');
    buttons.forEach(function(btn) {
      btn.style.pointerEvents = 'auto';
      btn.style.zIndex = '99999';
      btn.style.position = 'relative';
      btn.style.cursor = 'pointer';
    });
  }

  /* ---------------------------------------------------------
     4. APPLY IMAGES FROM CONFIG
     --------------------------------------------------------- */
  function applySceneImages() {
    var photoEls = document.querySelectorAll("[data-photo-key]");
    photoEls.forEach(function (el) {
      var key = el.getAttribute("data-photo-key");
      if (sceneImageMap[key]) {
        el.setAttribute("src", sceneImageMap[key]);
      }
    });
  }

  /* If a photo fails to load, swap in a friendly on-brand
     placeholder instead of a broken-image icon. Decorative
     SVGs (gifts, cake) fall back to a plain tinted shape. */
  function setupImageFallbacks() {
    document.querySelectorAll("img[data-photo-key]").forEach(function (img) {
      img.addEventListener("error", function onErr() {
        img.removeEventListener("error", onErr);
        img.src = PLACEHOLDER_IMG;
      });
    });

    document.querySelectorAll(".gift-illustration, .cake-illustration").forEach(function (img) {
      img.addEventListener("error", function onErr() {
        img.removeEventListener("error", onErr);
        img.style.display = "none";
        var holder = img.closest(".gift-button, .cake-stage");
        if (holder) holder.classList.add("img-fallback");
      });
    });
  }

  /* ---------------------------------------------------------
     5. SCENE NAVIGATION
     --------------------------------------------------------- */
  function showScene(name, opts) {
    opts = opts || {};
    var next = document.getElementById("scene-" + name);
    if (!next || state.current === name) return;

    var current = state.current
      ? document.getElementById("scene-" + state.current)
      : null;

    function activateNext() {
      next.style.display = "flex";
      void next.offsetWidth; /* force reflow so the animation replays */
      next.classList.add("active");
      if (!opts.immediate) {
        next.classList.add("enter");
        next.addEventListener("animationend", function onEnd() {
          next.classList.remove("enter");
          next.removeEventListener("animationend", onEnd);
          // Force buttons clickable after animation
          setTimeout(makeButtonsClickable, 100);
        }, { once: true });
      }
      state.current = name;
      updateProgressDots(name);
      announce(next.getAttribute("aria-label") || name);
      // Force buttons clickable immediately
      setTimeout(makeButtonsClickable, 100);
    }

    if (current && !opts.immediate) {
      current.classList.add("exit");
      current.addEventListener("animationend", function onExit() {
        current.classList.remove("active", "exit");
        current.style.display = "none";
        current.removeEventListener("animationend", onExit);
        activateNext();
      }, { once: true });
    } else {
      if (current) {
        current.classList.remove("active", "exit", "enter");
        current.style.display = "none";
      }
      activateNext();
    }
  }

  function updateProgressDots(sceneName) {
    var step = DOT_STEP_BY_SCENE[sceneName];
    if (step === undefined) return;
    document.querySelectorAll(".dot").forEach(function (dot) {
      var dotStep = Number(dot.getAttribute("data-step"));
      dot.classList.toggle("is-current", dotStep === step);
    });
  }

  /* Screen-reader announcement of the active scene, without
     relying on any visible "eyebrow" chrome. */
  var liveRegion;
  function setupLiveRegion() {
    liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.style.position = "absolute";
    liveRegion.style.width = "1px";
    liveRegion.style.height = "1px";
    liveRegion.style.overflow = "hidden";
    liveRegion.style.clip = "rect(0 0 0 0)";
    document.body.appendChild(liveRegion);
  }
  function announce(text) {
    if (liveRegion) liveRegion.textContent = text;
  }

  /* ---------------------------------------------------------
     6. GIFT INTERACTION
     --------------------------------------------------------- */
  function handleGiftClick(giftButton) {
    var giftNumber = giftButton.getAttribute("data-gift");
    var destination = GIFT_DESTINATIONS[giftNumber];
    if (!destination) return;

    giftButton.classList.add("is-shaking");
    giftButton.addEventListener("animationend", function onShake() {
      giftButton.classList.remove("is-shaking");
      giftButton.removeEventListener("animationend", onShake);
      giftsOpened[giftNumber] = true;
      giftButton.classList.add("is-opened");
      showScene(destination);
    }, { once: true });
  }

  /* ---------------------------------------------------------
     7. WIRE UP ALL BUTTONS - USING EVENT DELEGATION
     --------------------------------------------------------- */
  function wireNavigation() {
    // Use event delegation on the entire card-inner container
    // This catches clicks even if buttons are covered
    var cardInner = document.getElementById('cardInner');
    
    cardInner.addEventListener('click', function(e) {
      var target = e.target;
      
      // Find the actual button (in case user clicked on button content)
      while (target && target !== cardInner) {
        if (target.tagName === 'BUTTON' || target.tagName === 'A') {
          handleButtonClick(target, e);
          break;
        }
        target = target.parentElement;
      }
    }, true); // Use capture phase to catch events early
    
    // Also attach direct listeners as backup
    attachDirectListeners();
  }
  
  function handleButtonClick(button, event) {
    var id = button.id;
    console.log('Button clicked:', id);
    
    // Prevent default and stop propagation
    event.preventDefault();
    event.stopPropagation();
    
    // Handle based on button ID
    switch(id) {
      case 'btnYesIntro':
        showScene('excitement');
        break;
      case 'btnNoIntro':
        showScene('no');
        break;
      case 'btnTryAgain':
        showScene('intro');
        break;
      case 'btnYesExcite1':
      case 'btnYesExcite2':
        showScene('gifts');
        break;
      case 'btnToWish':
        showScene('wish');
        break;
      case 'btnHeartToWish':
        console.log('Heart button clicked!');
        showScene('wish');
        break;
      case 'btnBackToGifts1':
      case 'btnBackToGifts2':
        console.log('Memories heart button clicked!');
        showScene('gifts');
        break;
      case 'scrollLeft':
        var photosContainer = document.getElementById('photosContainer');
        if (photosContainer) {
          photosContainer.scrollBy({ left: -400, behavior: 'smooth' });
        }
        break;
      case 'scrollRight':
        var photosContainer2 = document.getElementById('photosContainer');
        if (photosContainer2) {
          photosContainer2.scrollBy({ left: 400, behavior: 'smooth' });
        }
        break;
      case 'btnToFinal':
        console.log('Letter heart button clicked! Going to gifts');
        showScene('gifts');
        break;
      case 'btnGiftsArrow':
        showScene('final');
        break;
      case 'btnReplay':
        giftsOpened = { 1: false, 2: false, 3: false };
        document.querySelectorAll('.gift-button').forEach(function (btn) {
          btn.classList.remove('is-opened');
        });
        showScene('intro');
        break;
      default:
        // Check if it's a gift button
        if (button.classList.contains('gift-button')) {
          handleGiftClick(button);
        }
        break;
    }
    
    return false;
  }
  
  function attachDirectListeners() {
    // Keep direct listeners as backup
    on("btnYesIntro", "click", function () { showScene("excitement"); });
    on("btnNoIntro", "click", function () { showScene("no"); });
    on("btnTryAgain", "click", function () { showScene("intro"); });

    on("btnYesExcite1", "click", function () { showScene("gifts"); });
    on("btnYesExcite2", "click", function () { showScene("gifts"); });

    document.querySelectorAll(".gift-button").forEach(function (btn) {
      btn.addEventListener("click", function () { handleGiftClick(btn); });
    });

    on("btnToWish", "click", function () { showScene("wish"); });
    
    var heartBtn = document.getElementById("btnHeartToWish");
    if (heartBtn) {
      heartBtn.addEventListener("click", function() {
        console.log("Heart button clicked!");
        showScene("wish");
      });
    }
    
    on("btnBackToGifts1", "click", function () { showScene("gifts"); });
    
    var memoryHeartBtn = document.getElementById("btnBackToGifts2");
    if (memoryHeartBtn) {
      memoryHeartBtn.addEventListener("click", function() {
        console.log("Memories heart button clicked!");
        showScene("gifts");
      });
    }
    
    var scrollLeftBtn = document.getElementById("scrollLeft");
    var scrollRightBtn = document.getElementById("scrollRight");
    var photosContainer = document.getElementById("photosContainer");
    
    if (scrollLeftBtn && photosContainer) {
      scrollLeftBtn.addEventListener("click", function() {
        photosContainer.scrollBy({ left: -400, behavior: 'smooth' });
      });
    }
    
    if (scrollRightBtn && photosContainer) {
      scrollRightBtn.addEventListener("click", function() {
        photosContainer.scrollBy({ left: 400, behavior: 'smooth' });
      });
    }

    var letterHeartBtn = document.getElementById("btnToFinal");
    if (letterHeartBtn) {
      console.log("Letter button found, attaching events");
      
      letterHeartBtn.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Letter heart button clicked! Going to gifts");
        showScene("gifts");
      }, true);
      
      letterHeartBtn.onclick = function(e) {
        e.preventDefault();
        console.log("Letter onclick triggered - going to gifts");
        showScene("gifts");
        return false;
      };
    }
    
    on("btnToFinal", "click", function () { 
      console.log("btnToFinal on() triggered");
      showScene("gifts"); 
    });
    on("btnGiftsArrow", "click", function () { showScene("final"); });

    on("btnReplay", "click", function () {
      giftsOpened = { 1: false, 2: false, 3: false };
      document.querySelectorAll(".gift-button").forEach(function (btn) {
        btn.classList.remove("is-opened");
      });
      showScene("intro");
    });
  }

  function on(id, evt, handler) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(evt, handler);
  }
})();
