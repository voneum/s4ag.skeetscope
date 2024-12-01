import { For, onMount,createSignal, onCleanup, createEffect, Show } from 'solid-js';
import { createStore } from "solid-js/store"
import { Jetstream } from "./Jetstream";
import { BSkyApi_Record } from './BSkyApi_Record';

import styles from './BSky.module.css';
import { JetstreamDetail } from './JetstreamDetail';
import { TextHelper } from './TextHelper';
import { SVGs } from './SVGs';
import { WordBag } from './WordBag';
import { BarChartRace } from './BarChartRace';
import RadioButtonArray from './RadioButtonArray';
import { Terms } from './Terms';

export const BSky = () => {

  let elHelpDialog: HTMLDialogElement;
  let wordBags: WordBag[] = [];
  let barcharts:BarChartRace[] = [];
  let filterTerms:Set<string>[] = [];
  let wordCount = 0;

  //let elHtmlDivElements: HTMLDivElement[] = [];

  const [messageCount_GetterFn, messageCount_SetterFn] = createSignal<number>(0);
  const [dataReceived_GetterFn, dataReceived_SetterFn] = createSignal<number>(0);

  const [socketOpen_GetterFn, socketOpen_SetterFn] = createSignal<boolean>(false);
  const [divElements_GetterFn, divElements_SetterFn] = createSignal<HTMLDivElement[]>([]);
  const [safe_GetterFn, safe_SetterFn] = createSignal<boolean>(true);

  const [store, setStore] = createStore<number[]>([]) // A store that is an array
  
  const [stringType_GetterFn, stringType_SetterFn] = createSignal("Words");
  const stringTypeOptions = ["Words", "Mentions", "Hashtags"];

  
  const [activeBars_GetterFn, activeBars_SetterFn] = createSignal<number>(10);

  // React to changes in selectedOption
  createEffect(() => {
    console.log("Selected option changed:", stringType_GetterFn());
    clearFeed();
  });

  createEffect(() => {
    console.log("safe mode:", safe_GetterFn());
  });

  createEffect(() => {
    console.log("Active bars option changed:", activeBars_GetterFn());
    BarChartRace.BAR_COUNT = activeBars_GetterFn();

    //divElements_GetterFn()[0].classList.add(styles.divChartContainer);

    for (let i = 0; i < divElements_GetterFn().length; i++) {
      const element = divElements_GetterFn()[i];
      element.style.height = `${BarChartRace.BAR_COUNT * 30}px`;

      barcharts[i].Clear();
    }

  });

  

  const wantedCollections = [
    "app.bsky.feed.post", 
    // "app.bsky.feed.like",
    // "app.bsky.feed.repost", //Represents repost events (similar to retweets on Twitter).
    // "app.bsky.feed.follow", //Represents follow actions (users following others).
    // "app.bsky.feed.block", //Represents block events (when users block others).
    // "app.bsky.feed.mute", //Represents mute events (when users mute others).
    // "app.bsky.feed.reply", //Represents reply events (responses to posts).
  ];

  const jetstream = new Jetstream({
    wantedCollections: wantedCollections
  });

  // Register listeners for a specific collection.
  jetstream.onCreate("app.bsky.feed.post", (event) => {
    
    const eventDetail = event.detail as JetstreamDetail;

    messageCount_SetterFn(eventDetail.MessageCount);
    dataReceived_SetterFn(eventDetail.DataLength);

    const postResponse = eventDetail.PostResponse;
    const record = postResponse.Commit?.Record as BSkyApi_Record;
    let media = "";

    if (record.Embed){
      
      switch (record.Embed?.Type){
        case "app.bsky.embed.recordWithMedia":
          media = "RM";
          break;
        case "app.bsky.embed.record":
          media = "R";
          break;
        case "app.bsky.embed.images":
          media = "I";
          break;
        case "app.bsky.embed.external":
          media = "E";
          break;
        case "app.bsky.embed.video":
          media = "V";
          break;
        default:
          console.log("📺", record.Embed?.Type,record.Embed?.Video);
      }
    }

    let lower = record.Text.toLowerCase();
    let updateCharts:boolean = false;

    const handles = TextHelper.ExtractBlueskyHandles(lower);

    if (stringType_GetterFn() === "Mentions"){
      for (let j = 0; j < handles.length; j++) {
        const word = handles[j];            
        wordCount++;
        if (!updateCharts) updateCharts = wordCount % 2 === 0;
        //console.log("--", wordCount,updateCharts);
        //if (word[0] === "#" ){
        //if (word[0] === "@"){
        //if (word[0] === "#" || word[0] === "@"){
        //if (word[0] !== "#" && word[0] !== "@"){
          processWordByLength(word);
        //}      
      }
    } else {

      //remove any hashtags from post
      if (handles.length > 0){
        handles.forEach((handle) => {
            lower = lower.replaceAll(handle,"");
        });
      }

      const hashtags = TextHelper.ExtractHashtags(lower);
      if (stringType_GetterFn() === "Hashtags"){
        for (let j = 0; j < hashtags.length; j++) {
          const word = hashtags[j];            
          wordCount++;
          if (!updateCharts) {
            updateCharts = wordCount % 5 === 0;
          }
          //console.log("--", wordCount,updateCharts);
          //if (word[0] === "#" ){
          //if (word[0] === "@"){
          //if (word[0] === "#" || word[0] === "@"){
          //if (word[0] !== "#" && word[0] !== "@"){
    
              
            processWordByLength(word);
          //}      
        }
      } else {

        if (hashtags.length > 0){
          handles.forEach((hastag) => {
              lower = lower.replaceAll(hastag,"");
          });
        }

        const words = TextHelper.splitToAlphabeticWords(lower);   
    

        for (let j = 0; j < words.length; j++) {
          const word = words[j];            
          wordCount++;
          if (!updateCharts) updateCharts = wordCount % 100 === 0;
          //console.log("--", wordCount,updateCharts);
          //if (word[0] === "#" ){
          //if (word[0] === "@"){
          //if (word[0] === "#" || word[0] === "@"){
          if (word[0] !== "#" && word[0] !== "@"){
            processWordByLength(word);
          }      
        }

      }
    }
    
    if (updateCharts){
      //console.error("process", wordCount);
      for (let i = 0; i < 9; i++) {
        processWord(i);        
      }
    }

    updateCharts = false;

  });

  function processWordByLength(word: string): void {
    let wordLen = word.length;
    if (word.startsWith("#")){
      wordLen--;
    } else if (word.startsWith("@")){
      const dot = word.indexOf(".");
      wordLen = dot - 1;
    }

    const index = Math.min(wordLen - 4, 8); // Determine the appropriate index
    if (index >= 0){
      wordBags[index].AddWord(word);
      setStore(index, store[index] + 1);
    }
  }


  function processWord(index: number){
      let topWords = wordBags[index].GetTopWords(BarChartRace.BAR_COUNT,safe_GetterFn());
      
      if (!barcharts[index].IsAnimating){
        barcharts[index].UpdateWords(topWords);
      }

  }

  onMount(() => {
    //const div: HTMLDivElement = document.createElement("div");


    divElements_SetterFn([
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
      document.createElement("div"),
    ]);

    divElements_GetterFn()[0].classList.add(styles.divChartContainer);
    divElements_GetterFn()[1].classList.add(styles.divChartContainer);
    divElements_GetterFn()[2].classList.add(styles.divChartContainer);
    divElements_GetterFn()[3].classList.add(styles.divChartContainer);
    divElements_GetterFn()[4].classList.add(styles.divChartContainer);
    divElements_GetterFn()[5].classList.add(styles.divChartContainer);
    divElements_GetterFn()[6].classList.add(styles.divChartContainer);
    divElements_GetterFn()[7].classList.add(styles.divChartContainer);
    divElements_GetterFn()[8].classList.add(styles.divChartContainer);

    barcharts = [
      new BarChartRace("4 letters", divElements_GetterFn()[0]),
      new BarChartRace("5 letters", divElements_GetterFn()[1]),
      new BarChartRace("6 letters", divElements_GetterFn()[2]),
      new BarChartRace("7 letters", divElements_GetterFn()[3]),
      new BarChartRace("8 letters", divElements_GetterFn()[4]),
      new BarChartRace("9 letters", divElements_GetterFn()[5]),
      new BarChartRace("10 letters", divElements_GetterFn()[6]),
      new BarChartRace("11 letters", divElements_GetterFn()[7]),
      new BarChartRace(">11 letters", divElements_GetterFn()[8]),
    ];


    filterTerms = [
      Terms.AdultHashtagsByLength(4),
      Terms.AdultHashtagsByLength(5),
      Terms.AdultHashtagsByLength(6),
      Terms.AdultHashtagsByLength(7),
      Terms.AdultHashtagsByLength(8),
      Terms.AdultHashtagsByLength(9),
      Terms.AdultHashtagsByLength(10),
      Terms.AdultHashtagsByLength(11),
      Terms.AdultHashtagsByLengthGreaterThan(11),
    ];

    wordBags = [
      new WordBag(filterTerms[0]),
      new WordBag(filterTerms[1]),
      new WordBag(filterTerms[2]),
      new WordBag(filterTerms[3]),
      new WordBag(filterTerms[4]),
      new WordBag(filterTerms[5]),
      new WordBag(filterTerms[6]),
      new WordBag(filterTerms[7]),
      new WordBag(filterTerms[8]),
    ];

    //update the word counts
    setStore([0,0,0,0,0,0,0,0,0]);

    // Start listening to events.
    jetstream.onStart(() => {
      socketOpen_SetterFn(true);
    });
    jetstream.onClose(() => {
      socketOpen_SetterFn(false);
    });
    jetstream.start();

  })

  onCleanup(() => {
    barcharts.forEach((barchart) =>{
      barchart.Destroy();
    });
    
  });

  function startFeed(){
    jetstream.start();
  }
  function stopFeed(){
    jetstream.stop();
  }
  function clearFeed(){
    jetstream.clear();
    messageCount_SetterFn(0);
    dataReceived_SetterFn(0);
    
    
    wordBags = [
      new WordBag(filterTerms[0]),
      new WordBag(filterTerms[1]),
      new WordBag(filterTerms[2]),
      new WordBag(filterTerms[3]),
      new WordBag(filterTerms[4]),
      new WordBag(filterTerms[5]),
      new WordBag(filterTerms[6]),
      new WordBag(filterTerms[7]),
      new WordBag(filterTerms[8]),
    ];

    //update the word counts
    setStore([0,0,0,0,0,0,0,0,0]);

    wordCount = 0;
    barcharts.forEach((barchart) =>{
      barchart.Clear();
    });
    
  }
  function displayHelp(){
    elHelpDialog.showModal();

  }
  
  return (
    <>
      <header class={styles.header} style="display:flex;">
        <div style="font-size:clamp(1rem, 2.5vw, 1.5rem);font-weight:bold;display:block; align-self: center;margin-left:5px;">
        SkeetScope
        </div>
        <div style="flex-grow: 1;display:block; align-self: center; margin-left:10px;font-size:clamp(0.75rem, 2vw, 1.1rem);">
          the pulse of Bluesky posts
        </div>
        <div style="margin-right:15px; align-self: center;display:flex;cursor:pointer;" onclick={displayHelp}>
          <div innerHTML={SVGs.BlueSkyHelp}></div>
          <a style="font-size:clamp(0.6rem, 2vw, 1rem);">What's this?</a>
        </div>
        <div style="margin-right:5px;font-size:clamp(0.75rem, 2vw, 1.1rem);display:block; align-self: center; text-align: end;white-space: nowrap;">
          <div><span>New posts:</span> <span style="font-weight:bold;">{messageCount_GetterFn()}</span></div>
          <div><span>Data received:</span> <span style="font-weight:bold;">{(dataReceived_GetterFn()/1000000).toFixed(1)}MB</span></div>
        </div>
        
      </header>
      <main class={styles.main}>
        <div class={styles.mainHeader}>
          <div>
            <input id="safeCheck" type='checkbox' checked={safe_GetterFn()} style="margin-right: 3px;" onChange={(e) => {
              safe_SetterFn(e.currentTarget.checked);
            }} />
            <label for="safeCheck"style="margin-right: 10px;">Safe</label>

            Bars:
            <select style="margin-left: 3px;"
              onChange={(e) => {
                activeBars_SetterFn(Number.parseInt(e.currentTarget.value));
              }}
            >
              <option value="5">5</option>
              <option value="10" selected>10</option>
              <option value="20">20</option>
            </select>
          </div>
          <RadioButtonArray
            options={stringTypeOptions}
            selected={stringType_GetterFn()}
            onChange={(value) => stringType_SetterFn(value)}
          />
        </div>
        <div class={styles.mainBody}>
          <For each={divElements_GetterFn()}>
            {(item, index) =>
              // rendering logic for each element
              <div class={`${styles.divChartCard}`}>
                <div class={`${styles.divChartCardHeader} ${styles.divChartCardChild}`}>
                  <div class={styles.child1}>{ barcharts[index()].Name }</div>
                  <div title="Total word count" class={styles.child2}>total:{store[index()]}</div>
                </div>
                <div class={styles.divChartCardContent}>
                  { item }
                </div>
              </div>
            }
          </For>
        </div>
      </main>
      <footer class={styles.footer} style="display:flex;">
        <div style="margin:auto;">
          <Show when={!socketOpen_GetterFn()}>
            <button onclick={startFeed} style="padding:5px;font-size:20px;">Resume</button>
          </Show>
          <Show when={socketOpen_GetterFn()}>
            <button onclick={stopFeed} style="padding:5px;font-size:20px;">Pause</button>
          </Show>
          <button onclick={clearFeed} style="padding:5px;font-size:20px;">Clear</button>
        </div>
        <div style="position: absolute; right:5px;bottom:5px;">
          <a href="https://github.com/voneum/s4ag.skeetscope" target="_blank" innerHTML={SVGs.GithubLogo} title='GitHub'></a>
        </div>
      </footer>

      <dialog ref={(el) => { elHelpDialog = el}}>
        
          <div style="margin:10px">
            <h1 style="margin: auto;display: table;">SkeetScope</h1>

            <h2>SkeetScope: What?</h2>

            <div>Yet another random experiment with the BlueSky Firehose API.</div>
            <div>Close on the heels of my previous effort at <a href="https://www.s4ag.com/amerenglish/" target="_blank">Amerenglish</a></div>
            <div>This one is a standard tracker of word frequencies.</div>
            <div>I do like the racing bar charts. They're kind of cool.</div>
            
            <div>Inspired by (potentially NSFW) efforts such as:</div>

            <ul style="columns: 3;-webkit-columns: 3;-moz-columns: 3;margin:10px 20px;">
              <li><a href="https://jakebailey.dev/bsky-digital-rain/" target="_blank">ATmospheric Digital Rain</a></li>            
              <li><a href="https://www.bewitched.com/demo/rainbowsky/" target="_blank">RainbowSky</a></li>
              <li><a href="https://www.emojirain.lol/" target="_blank">EmojiRain</a></li>
              <li><a href="https://www.intothebluesky.lol/" target="_blank">Into the Bluesky</a></li>
              <li><a href="https://flo-bit.dev/bluesky-visualizers/" target="_blank">Bluesky Visualizers</a></li>
              <li><a href="https://firehose3d.theo.io/" target="_blank">Firehose 3D</a></li>
              <li><a href="https://swearsky.bagpuss.org/" target="_blank">SwearSky</a> (NSFW)</li>
              <li><a href="https://javier.computer/bluesky/iam" target="_blank">I am...</a></li>
              <li><a href="https://firesky.tv/" target="_blank">Firesky</a></li>
              <li><a href="https://lantto.github.io/bluesky-mosaic/" target="_blank">Bluesky Mosaic</a> (NSFW)</li>
              <li><a href="https://bluesky.toddle.site/signups" target="_blank">Bluesky Signups</a></li>
            </ul>
            
            <div>If you want to play with the code, find it on <a href="https://github.com/voneum/s4ag.skeetscope" target="_blank">GitHub</a>.</div>

            <div>Feel free to submit patches!</div>

          </div>

          <div style="display:grid;justify-content:center;">
            <form method="dialog">
              <button style="padding: 5px;
                  display: inline;
                  font-size: larger;
                  text-align: center;
                  background-color: #d3d3d3;
                  box-shadow: 2px 2px 2px gray;
                  cursor: pointer;
              }">OK</button>
            </form>
          </div>
        
      </dialog>
    </>
  );
};
