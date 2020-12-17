// allgemein gültige Funktionen
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function taste_gedrückt(taste) {
  let taste_nummer;
  taste_nummer = taste.keyCode;
  schlitten.movement(String.fromCharCode(taste_nummer));
}

// Klasse Spieler
class Spieler {
  constructor() {
    this.images = ["images/Schlitten_n1.png", "images/Schlitten_n2.png", "images/Schlitten_n3.png"];
    this.schlitten_animation();
    this.get_current_position();
    this.leben = parseInt(document.getElementById('Leben').innerHTML.slice(-1));
    this.buehne = new Bühne;
  }
  get_current_position() {
    this.element = document.getElementById('Schlitten').style;
    this.positiony = parseInt(this.element.top.slice(0, -2));
    this.positionx = parseInt(this.element.left.slice(0, -2));
  }
  // Bewegen des Schlittens
  movement(key) {
    this.get_current_position();
    if (key.toUpperCase() == 'W' && this.positiony > 100) {
      this.element.top = this.positiony - 100 + "px";
    } else if (key.toUpperCase() == 'S' && this.positiony < window.screen.height - 400) {
      this.element.top = this.positiony + 100 + "px";
    } else if (key.toUpperCase() == 'A' && this.positionx > 50) {
      this.element.left = this.positionx - 100 + "px";
    } else if (key.toUpperCase() == 'D' && this.positionx < window.screen.width - 600) {
      this.element.left = this.positionx + 100 + "px";
    }
  }
  //Schlitten "GIF" Animation
  async schlitten_animation() {
    this.cur_image = this.images[1];
    let index = 0;
    while (true) {
      await sleep(600);
      if (index < this.images.length) {
        document.getElementById('Schlitten').src = this.images[index];
      } else {
        index = 0
        document.getElementById('Schlitten').src = this.images[index];
      }
      index = index + 1;
    }
  }
  hit(score) {
    this.leben = this.leben - 1
    if (this.leben > 0) {
      document.getElementById('Leben').innerHTML = "Leben: " + this.leben;
    } else {
      this.buehne.game_over(score)
    }
  }
  get_hitbox() {
    this.get_current_position();
    return [this.positionx, this.positionx + 480, this.positiony - 20, this.positiony + 200]
  }
}

// Klasse Gegner
class Gegner {
  constructor(wurfobjekt, spieler) {
    this.get_current_position();
    this.play(wurfobjekt, spieler);
  }
  get_current_position() {
    this.element = document.getElementById('Grantelbart').style;
    this.positiony = parseInt(this.element.top.slice(0, -2));
    this.positionx = parseInt(this.element.left.slice(0, -2));
  }
  async wurf(wurfobjekt) {
    this.get_current_position()
    wurfobjekt.go_to("89%", this.positiony + "px");
    document.getElementById('Grantelbart').src = "images/grantelbart_wurf_0.png";
    document.getElementById('Grantelbart').style.height = "250px";
    document.getElementById('Grantelbart').style.width = "200px";
    await sleep(400)
    document.getElementById('Grantelbart').src = "images/grantelbart_wurf.png";
    document.getElementById('Grantelbart').style.width = "200px";
    document.getElementById('Grantelbart').style.height = "200px";
    wurfobjekt.wurf();
    await sleep(1000)
    document.getElementById('Grantelbart').src = "images/grantelbart_stand.png";
    document.getElementById('Grantelbart').style.width = "100px";
  }
  async play(wurfobjekt, spieler) {
    while (true) {
      this.element.top = spieler.positiony + 120 + "px";
      this.get_current_position();
      await wurfobjekt.go_to("89.5%", this.positiony + 50 + "px");
      await wurfobjekt.erzeugen();
      await this.wurf(wurfobjekt);
      await sleep(600);
      await wurfobjekt.verschwinden();
    }
  }
}

// Klasse Wurfobjekt
class Wurfobjekt {
  constructor(spieler, score,buehne) {
    this.element = document.getElementById('Schneeball').style;
    this.get_current_position();
    this.spieler = spieler;
    this.score = score;
  }
  get_current_position() {
    this.positiony = parseInt(this.element.top.slice(0, -2));
    this.positionx = parseInt(this.element.left.slice(0, -2));
  }
  async erzeugen() {
    var i;
    for (i = 0; i < 1; i = i + 0.05) {
      this.element.transform = "scale(" + i + ")";
      await sleep(40)
    }
  }
  go_to(x, y) {
    this.element.top = y;
    this.element.left = x;
  }
  verschwinden() {
    this.element.transform = "scale(1)";
    this.go_to("200%", "-2200px");
  }
  async wurf() {
    let i;
    this.get_current_position();
    this.element.top = this.positiony - 60 + "px";
    this.hit = false;
    for (i = 0; i < window.screen.width; i = i + 10) {
      this.get_current_position();
      this.element.left = screen.width - 350 - i + "px";
      this.check_kollision();
      await sleep(2);
    }
    if (this.hit == false) {
      this.score.add();
    }
  }
  check_kollision() {
    this.get_current_position();
    let pos_spieler = this.spieler.get_hitbox();
    if (this.positionx >= pos_spieler[0] && this.positionx <= pos_spieler[1] && this.positiony >= pos_spieler[2] && this.positiony <= pos_spieler[3]) {
      this.spieler.hit(this.score.get_sore())
      this.verschwinden()
      this.hit = true;
    }
  }
}

// Klasse Score
class Score {
  constructor() {
    this.score = 0;
  }
  add() {
    this.score = this.score + 1
    this.element = document.getElementById('Score').innerHTML = "Score: " + this.score;
  }
  get_sore() {
    return this.score
  }
}

class Bühne {
  constructor() {
    this.body = document.body.style;
    this.spieler = document.getElementById("Schlitten").style;
    this.gegner = document.getElementById("Grantelbart").style;
    this.wurfobjekt = document.getElementById("Schneeball").style;
    this.score = document.getElementById("Score").style;
    this.Leben = document.getElementById("Leben").style;
    this.h1 = document.getElementById("h1").style;
    this.h2 = document.getElementById("h2").style;
    this.button = document.getElementById("button").style;
    this.button_container = document.getElementById("bttn_container").style;
    this.verschwinden = [this.spieler, this.gegner, this.wurfobjekt, this.score, this.Leben];
    this.erscheinen = [this.h1, this.h2, this.button, this.button_container]
  }
  change_bg(url) {
    this.body.backgroundImage = "url(" + url + ")"
  }
  game_over(score) {
    let score_end = document.getElementById("Score")
    let index;
    for (index in this.verschwinden) {
      this.verschwinden[index].display = "none";
    }
    for (index in this.erscheinen) {
      this.erscheinen[index].display = "block";
    }
    document.getElementById("h2").innerHTML = "Ihr Score berägt: <br><br>"+score;
    this.change_bg("images/background_n1_blur.png")
  }
}

// Schneeball fliegt weg - erledigt
// Weihnachtsmann getroffen ? - erledigt
// Sprechblase wenn nicht getroffen von Grantelbart
// Gratelbart schönere "smoothe" Bewegung - kinda
// Menü um die Schwierigkeit auszuwählen
// Score - kinda
// fine tuning
// Clean up
// Mehrspieler ? --> Grantelbart wird lokal von weiterm Spieler gesteuert
// Power Ups ? --> Schild für Weihnachtsmann

// main funktion
async function main() {
  // Event Listener
  window.addEventListener("keypress", taste_gedrückt);

  await sleep(2000);

  // erzeuge Score
  score = new Score;

  // erzeuge Schlitten
  schlitten = new Spieler(score);

  // erzeuge Schneeball
  schneeball = new Wurfobjekt(schlitten, score);

  // erzeuge Grantelbart
  grantelbart = new Gegner(schneeball, schlitten);




}
main()
