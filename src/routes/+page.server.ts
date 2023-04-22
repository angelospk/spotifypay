import type { PageServerLoad} from './$types'
import pkg from 'papaparse';
const { parse } = pkg;
type InputRecord = { [name: string]: string };
type OutputRecord = { name: string; data: number[] };
function transformData(input: InputRecord[]): OutputRecord[] {
    const output: { [name: string]: OutputRecord } = {};
  
    input.forEach((record: InputRecord) => {
      Object.entries(record).forEach(([name, value]) => {
        if (!output[name]) {
          output[name] = { name, data: [] };
        }
        output[name].data.push(parseInt(value, 10));
      });
    });
  
    return Object.values(output);
}
const prompts=["Knock knock! Who's there? It's me, your monthly Spotify DJ, here to spin the tracks that pay for my place in our digital music fam!", "Roses are red, violets are blue, Spotify's got jams, and here's my payment to you!", "Why did the music note pay its friend? To stay in tune with the Spotify Family groove! 🎶 Here's my share for this month!", "🎵They see me payin', they hatin', but I'm just trying to keep our Spotify playlist bumpin'! 💸", "Friend, let's jam to the rhythm of our friendship, and here's my contribution to keeping our Spotify Family going strong!", "In the name of good vibes and great tunes, I present thee with my monthly offering to the Spotify Gods! 🎧", "Hey there! Just sliding into your DMs to pay my monthly dues to the almighty Spotify playlist master. Your musical taste shall continue to bless our ears! 🎶💸", "The time has come, my friend, for me to pay the piper – or in this case, the Spotify Family plan! 🎵💰","As the sun sets on another month, I'm here to make it rain with my share of the Spotify Family plan! 🌦️🎵", "The beat must go on, and so must our Spotify subscription! Presenting my monthly offering to the rhythm gods! 🥁💸", "Alert! Your friendly neighborhood music lover is here to pay their dues for our rocking Spotify Family plan! 🎶🕺", "A wise person once said, 'Music is the soundtrack of our lives.' Here's my contribution to the epic soundtrack of our Spotify Family! 🎧🎸", "In the spirit of camaraderie and tunes that never end, I present my monthly contribution to our fantastic Spotify Family! 💃🎶", "Our Spotify Family is like a beautiful symphony, and I'm here to pay my part in this melodious masterpiece! 🎵🎻", "Step right up and witness the amazing, the incredible, the timely Spotify Family payment! Let the music play on! 🎪🎵", "In a world where friends share the joys of music, one member stands up and pays their share for the Spotify Family plan! 🌍🎤", "Ladies and gentlemen, the moment you've all been waiting for… my monthly contribution to our glorious Spotify Family! Cue the applause! 👏🎧", "Just like our favorite song on repeat, here I am with my monthly payment to keep our Spotify Family playlist bumpin'! 🔄🎶"]

export const load : PageServerLoad = async () => {

    

    let url="https://docs.google.com/spreadsheets/d/1CSkvPSnopGYe746E7_8j-0fUNfPYi5g0whyCz3lF-t8/export?format=csv&gid=0"
    //fetch url
    let response = await fetch(url)
    //convert to text
    let text = await response.text()
    // Parse the CSV text
    const parsedData = parse(text, { header: true }).data;
    const randomIndex = Math.floor(Math.random() * prompts.length);
    const randomString = prompts[randomIndex];
    return {
        status: 200, // HTTP status code
        body: {
          lines: transformData(parsedData as InputRecord[]),
            prompt: randomString
        },
      };
}