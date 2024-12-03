import { For, onMount,createSignal, onCleanup, createEffect, Show } from 'solid-js';
import { createStore } from "solid-js/store"
import { Jetstream } from "./Jetstream";
import { BSkyApi_Record } from './BSkyApi_Record';

import styles from './BSky.module.css';
import { JetstreamDetail } from './JetstreamDetail';
import { TextHelper } from './TextHelper';
import { SVGs } from './SVGs';
import { TermBag as TermBag } from './TermBag';
import { BarChartRace } from './BarChartRace';
import RadioButtonArray from './RadioButtonArray';
import { Terms } from './Terms';
import toast, { Toaster } from 'solid-toast';


export const BSky = () => {

  let elHelpDialog: HTMLDialogElement;
  let wordBags: TermBag[] = [];
  let mentionBags: TermBag[] = [];
  let hashtagBags: TermBag[] = [];
  let barcharts:BarChartRace[] = [];
  let filterTerms:Set<string>[] = [];
  let noiseTerms:Set<string>[] = [];
  let termCount = 0;
  let toastId: string = "";

  //let elHtmlDivElements: HTMLDivElement[] = [];

  const [messageCount_GetterFn, messageCount_SetterFn] = createSignal<number>(0);
  const [dataReceived_GetterFn, dataReceived_SetterFn] = createSignal<number>(0);

  const [socketOpen_GetterFn, socketOpen_SetterFn] = createSignal<boolean>(false);
  const [divElements_GetterFn, divElements_SetterFn] = createSignal<HTMLDivElement[]>([]);
  const [safe_GetterFn, safe_SetterFn] = createSignal<boolean>(true);
  const [noise_GetterFn, noise_SetterFn] = createSignal<boolean>(false);

  const [wordCounts_GetterFn, wordCounts_SetterFn] = createStore<number[]>([]) // A store that is an array
  const [mentionCounts_GetterFn, mentionCounts_SetterFn] = createStore<number[]>([]) // A store that is an array
  const [hashtagCounts_GetterFn, hashtagCounts_SetterFn] = createStore<number[]>([]) // A store that is an array
  
  const [stringType_GetterFn, stringType_SetterFn] = createSignal("Words");
  const stringTypeOptions = ["Words", "Mentions", "Hashtags"];

  
  const [activeBars_GetterFn, activeBars_SetterFn] = createSignal<number>(10);

  // React to changes in selectedOption
  createEffect((prev) => {
    console.log("Selected option changed:", prev, stringType_GetterFn());

    if (prev) { //seems to want to be undefined when it doesn't change ??
      blankCharts();
      updateAllCharts();
    }
    //clearFeed();
  });

  createEffect(() => {
    console.log("safe mode:", safe_GetterFn());
    //updateAllCharts();
  });
  createEffect(() => {
    console.log("noise mode:", noise_GetterFn());
    //updateAllCharts();
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


    //#region Urls
    const urls = TextHelper.ExtractUrls(lower);
    for (let j = 0; j < urls.length; j++) {
      const url = urls[j];            
      termCount++;
    }
    //remove any Urls from post
    if (urls.length > 0){
      //console.log(urls);
      urls.forEach((url) => {
          lower = lower.replaceAll(url,"");
      });
    }
    //#endregion  

    //#region Mentions
    const handles = TextHelper.ExtractBlueskyHandles(lower);
    for (let j = 0; j < handles.length; j++) {
      const word = handles[j];            
      termCount++;
      if (stringType_GetterFn() === stringTypeOptions[2] && !updateCharts) updateCharts = termCount % 2 === 0; 
      //console.log("--", wordCount,updateCharts);
      //if (word[0] === "#" ){
      //if (word[0] === "@"){
      //if (word[0] === "#" || word[0] === "@"){
      //if (word[0] !== "#" && word[0] !== "@"){
        processTermByLength(word);
      //}      
    }
    //remove any handles from post
    if (handles.length > 0){
      handles.forEach((handle) => {
          lower = lower.replaceAll(handle,"");
      });
    }
    //#endregion  

    //#region Hashtags
    const hashtags = TextHelper.ExtractHashtags(lower);
    
    for (let j = 0; j < hashtags.length; j++) {
      const word = hashtags[j];            
      termCount++;
      if (stringType_GetterFn() === stringTypeOptions[1] && !updateCharts) {
        updateCharts = termCount % 5 === 0;
      }
      //console.log("--", wordCount,updateCharts);
      //if (word[0] === "#" ){
      //if (word[0] === "@"){
      //if (word[0] === "#" || word[0] === "@"){
      //if (word[0] !== "#" && word[0] !== "@"){

          
        processTermByLength(word);
      //}      
    }      

    if (hashtags.length > 0){
      handles.forEach((hastag) => {
          lower = lower.replaceAll(hastag,"");
      });
    }
    //#endregion  

    //#region Words
    const words = TextHelper.splitToAlphabeticWords(lower);     

    for (let j = 0; j < words.length; j++) {
      const word = words[j];            
      termCount++;
      if (stringType_GetterFn() === stringTypeOptions[0] && !updateCharts) updateCharts = termCount % 100 === 0;
      //console.log("--", wordCount,updateCharts);
      //if (word[0] === "#" ){
      //if (word[0] === "@"){
      //if (word[0] === "#" || word[0] === "@"){
      if (word[0] !== "#" && word[0] !== "@"){
        processTermByLength(word);
      }      
    }
    //#endregion
    
    
    if (updateCharts){
      updateAllCharts();
    }

    updateCharts = false;

  });

  function updateAllCharts(){
    for (let i = 0; i < 9; i++) {
      processTerms(i);        
    }
  }

  function processTermByLength(word: string): void {
    let wordLen = word.length;

    if (word.startsWith("#")){
      wordLen--;
      const index = Math.min(wordLen - 3, 8); // Determine the appropriate index
      if (index >= 0){
        hashtagBags[index].AddTerm(word);
        hashtagCounts_SetterFn(index, hashtagCounts_GetterFn[index] + 1);
      }


    } else if (word.startsWith("@")){
      const dot = word.indexOf(".");
      wordLen = dot - 1;
      const index = Math.min(wordLen - 3, 8); // Determine the appropriate index
      if (index >= 0){
        mentionBags[index].AddTerm(word);
        mentionCounts_SetterFn(index, mentionCounts_GetterFn[index] + 1);
      }


    } else {

      const index = Math.min(wordLen - 3, 8); // Determine the appropriate index
      if (index >= 0){
        wordBags[index].AddTerm(word);
        wordCounts_SetterFn(index, wordCounts_GetterFn[index] + 1);
      }
    }
  }


  function processTerms(index: number){

    let topTerms: { word: string; count: number}[] = [];

    switch (stringType_GetterFn()){
      case stringTypeOptions[0]:
        if (!wordBags || wordBags.length === 0) return;
        topTerms = wordBags[index].GetTopTerms(BarChartRace.BAR_COUNT,noise_GetterFn(),safe_GetterFn());
        break;
      case stringTypeOptions[1]:
        if (!mentionBags || mentionBags.length === 0) return;
        topTerms = mentionBags[index].GetTopTerms(BarChartRace.BAR_COUNT,safe_GetterFn(),safe_GetterFn());
        break;
      case stringTypeOptions[2]:
        if (!hashtagBags || hashtagBags.length === 0) return;
        topTerms = hashtagBags[index].GetTopTerms(BarChartRace.BAR_COUNT,safe_GetterFn(),safe_GetterFn());
        break;
      default:
        const errMsg = `The string type was not understood ${stringType_GetterFn()}`;
        console.log(errMsg);
        throw new Error(errMsg);
    }
      
    if (!barcharts[index].IsAnimating){
      barcharts[index].UpdateWords(topTerms);
    }

  }

  onMount(() => {
    //const div: HTMLDivElement = document.createElement("div");

    let divs: HTMLDivElement[] = [];
    barcharts = [];
    filterTerms = [];
    noiseTerms = [];
    wordBags = [];
    mentionBags = [];
    hashtagBags = [];
    for (let i = 0; i < 9; i++) {
      divs.push(document.createElement("div"));
      divs[i].classList.add(styles.divChartContainer);
      const title:string = i < 8 ? `${i+3} letters` : `>${i+2} letters`;
      barcharts.push(new BarChartRace(title, divs[i]));

      if (i < 8){
        filterTerms.push(Terms.AdultHashtagsByLength(i+3));
      } else {
        filterTerms.push(Terms.AdultHashtagsByLengthGreaterThan(i+3-1));
      }
      if (i < 8){
        noiseTerms.push(Terms.TermsByLength(Terms.NoiseTerms(), i+3))
      } else {
        noiseTerms.push(Terms.TermsByLengthGreaterThan(Terms.NoiseTerms(),i+3-1));
      }
      wordBags.push(new TermBag(noiseTerms[i]));
      mentionBags.push(new TermBag(filterTerms[i]));
      hashtagBags.push(new TermBag(filterTerms[i]));
    }
    divElements_SetterFn(divs);

    // divElements_SetterFn([
    //   document.createElement("div"),
    //   document.createElement("div"),
    //   document.createElement("div"),
    //   document.createElement("div"),
    //   document.createElement("div"),
    //   document.createElement("div"),
    //   document.createElement("div"),
    //   document.createElement("div"),
    //   document.createElement("div"),
    // ]);

    // divElements_GetterFn()[0].classList.add(styles.divChartContainer);
    // divElements_GetterFn()[1].classList.add(styles.divChartContainer);
    // divElements_GetterFn()[2].classList.add(styles.divChartContainer);
    // divElements_GetterFn()[3].classList.add(styles.divChartContainer);
    // divElements_GetterFn()[4].classList.add(styles.divChartContainer);
    // divElements_GetterFn()[5].classList.add(styles.divChartContainer);
    // divElements_GetterFn()[6].classList.add(styles.divChartContainer);
    // divElements_GetterFn()[7].classList.add(styles.divChartContainer);
    // divElements_GetterFn()[8].classList.add(styles.divChartContainer);

    // barcharts = [
    //   new BarChartRace("4 letters", divElements_GetterFn()[0]),
    //   new BarChartRace("5 letters", divElements_GetterFn()[1]),
    //   new BarChartRace("6 letters", divElements_GetterFn()[2]),
    //   new BarChartRace("7 letters", divElements_GetterFn()[3]),
    //   new BarChartRace("8 letters", divElements_GetterFn()[4]),
    //   new BarChartRace("9 letters", divElements_GetterFn()[5]),
    //   new BarChartRace("10 letters", divElements_GetterFn()[6]),
    //   new BarChartRace("11 letters", divElements_GetterFn()[7]),
    //   new BarChartRace(">11 letters", divElements_GetterFn()[8]),
    // ];


    // filterTerms = [
    //   Terms.AdultHashtagsByLength(4),
    //   Terms.AdultHashtagsByLength(5),
    //   Terms.AdultHashtagsByLength(6),
    //   Terms.AdultHashtagsByLength(7),
    //   Terms.AdultHashtagsByLength(8),
    //   Terms.AdultHashtagsByLength(9),
    //   Terms.AdultHashtagsByLength(10),
    //   Terms.AdultHashtagsByLength(11),
    //   Terms.AdultHashtagsByLengthGreaterThan(11),
    // ];

    // wordBags = [
    //   new TermBag(filterTerms[0]),
    //   new TermBag(filterTerms[1]),
    //   new TermBag(filterTerms[2]),
    //   new TermBag(filterTerms[3]),
    //   new TermBag(filterTerms[4]),
    //   new TermBag(filterTerms[5]),
    //   new TermBag(filterTerms[6]),
    //   new TermBag(filterTerms[7]),
    //   new TermBag(filterTerms[8]),
    // ];

    //update the word counts
    wordCounts_SetterFn([0,0,0,0,0,0,0,0,0]);
    mentionCounts_SetterFn([0,0,0,0,0,0,0,0,0]);
    hashtagCounts_SetterFn([0,0,0,0,0,0,0,0,0]);

    // Start listening to events.
    jetstream.onStart(() => {
      toastId = toast.loading('Waiting for BSky...', { position: "bottom-right", duration: 100000});
    });
    jetstream.onOpen(() => {
      socketOpen_SetterFn(true);
      toast.remove(toastId);
      toast.success("BSky feed started.");
    });
    jetstream.onClose(() => {
      socketOpen_SetterFn(false);
      toast.remove(toastId);
      toast("BSky feed closed.");
    });    
    jetstream.onError((err:string) => {
      socketOpen_SetterFn(false);
      toast.remove(toastId);
      toast.error(err);
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
    
    
    wordBags.length = 0;
    mentionBags.length = 0;
    hashtagBags.length = 0;
    for (let i = 0; i < 9; i++) {
      wordBags.push(new TermBag(noiseTerms[i]));
      mentionBags.push(new TermBag(filterTerms[i]));
      hashtagBags.push(new TermBag(filterTerms[i]));      
    }
    // wordBags = [
    //   new TermBag(filterTerms[0]),
    //   new TermBag(filterTerms[1]),
    //   new TermBag(filterTerms[2]),
    //   new TermBag(filterTerms[3]),
    //   new TermBag(filterTerms[4]),
    //   new TermBag(filterTerms[5]),
    //   new TermBag(filterTerms[6]),
    //   new TermBag(filterTerms[7]),
    //   new TermBag(filterTerms[8]),
    // ];

    //update the word counts
    wordCounts_SetterFn([0,0,0,0,0,0,0,0,0]);
    mentionCounts_SetterFn([0,0,0,0,0,0,0,0,0]);
    hashtagCounts_SetterFn([0,0,0,0,0,0,0,0,0]);

    termCount = 0;
    blankCharts();
    
  }
  function blankCharts(){
    barcharts.forEach((barchart) =>{
      barchart.Clear();
    });
  }

  function displayHelp(){
    elHelpDialog.showModal();

  }

  function listTerms(){

    const termArray: string[][] = [];

    for (let i = 0; i < wordBags.length; i++) {

      termArray.push([]);

      const terms = wordBags[i];      
      const allTerms = terms.GetTopTerms(terms.GetDistinctWordCount(), false);

      
      //console.log(`== ${allTerms[i]} ==================`);

      allTerms.forEach((term)=> {
        //console.log(term.word, term.count)
        termArray[i].push(term.word);
      });

      
      //console.log(`-----------------------`);
    }

    for (let i = 0; i < termArray.length; i++) {
      const concat = termArray[i].reduce((prev,curr)=>{
        return `${prev},\"${curr}\"`;
      },"");

      console.log(concat);
    }

  }
  function getInstanceCountByIndex(index: number){
    switch (stringType_GetterFn()){
      case stringTypeOptions[0]:
        return wordCounts_GetterFn[index]; 
      case stringTypeOptions[1]:
        return mentionCounts_GetterFn[index]; 
      case stringTypeOptions[2]:
        return hashtagCounts_GetterFn[index]; 
      default:
        const errMsg = `The string type was not understood ${stringType_GetterFn()}`;
        console.log(errMsg);
        throw new Error(errMsg);
    }
    
  }
  
  return (
    <>
      <header class={styles.header} style="display:flex;">
        <div style="font-size:clamp(1rem, 2.5vw, 1.5rem);font-weight:bold;display:block; align-self: center;margin-left:5px;">
          <span style="vertical-align: sub;" innerHTML={SVGs.BlueSkyButterfly}></span> SkeetScope
        </div>
        <div style="flex-grow: 1;display:block; align-self: center; margin-left:10px;font-size:clamp(0.75rem, 2vw, 1.1rem);">
        ➖ High frequency Bluesky terms right now.
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
            
            
            <Show when={stringType_GetterFn() === stringTypeOptions[0]}>
              <label for="noiseCheck"style="margin-right: 3px;">Noise</label>
                <input id="noiseCheck" type='checkbox' checked={!noise_GetterFn()} style="margin-right: 13px;" onChange={(e) => {
                  noise_SetterFn(!e.currentTarget.checked);
                }} />
            </Show>

            <label for="safeCheck"style="margin-right: 3px;">Safe</label>
            <input id="safeCheck" type='checkbox' checked={safe_GetterFn()} style="margin-right: 13px;" onChange={(e) => {
              safe_SetterFn(e.currentTarget.checked);
            }} />

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
                  <div title="Total word count" class={styles.child2}>total:{getInstanceCountByIndex(index())}</div>
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
        {/* <div style="position: absolute; right:45px;bottom:5px;">
          <button onclick={listTerms}>boooo</button>
        </div> */}
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

      <Toaster 
        position="bottom-right"
        gutter={8}
      />

    </>
  );
};
