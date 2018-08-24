# ink vn engine

So, you always wanted to make visual novels using [ink](https://github.com/inkle/ink)? I got you covered.  

This project is currently under heavy development, use at your own discretion.

## How does it work?

### Write your ink file

First, you should start your file with global configuration tags:
```
# screen_size: 1280x720
# text_speed: 30
```

Then, write your story as you'd usually do it.  
You should make an extensive use of tags to control what's displayed on screen.  

* Backgrounds can be switched
```
# background: path/to/your/background.png
```

* Character names can be displayed or hidden
```
# name: Paulloz
Or it can be used like this! # Paulloz
# name:
```

* Sprites can be displayed or removed (for now, only one sprite can be displayed at a time)
```
# sprite: path/to/your/sprite.png
# sprite: 
```

* Transitions can be played (fade is the only implemented one for now)
```
# transition: fade
```

* Files can be preloaded to load instantly in the future
```
# preload: path/to/an/image.png, and/another/one.png
```

### Include everything in your HTML

Just include the lib in your HTML file and create a new `InkVN.VN` object, giving it your ink file, an HTML element ID (a canvas is going to be created within it).

```html
<!DOCTYPE html>
<html>
    <body>
        <div id="vn"></div>
        <script src="ink-vn-engine.js"></script>
        <script type="text/javascript">
            window.onload = function() {
                var vn = new InkVN.VN("story.json", "vn");
            };
        </script>
    </body>
</html>
```

## Roadmap

This is what is going to be implemented soon:

* Better choice placements
* Use pictures as text backgrounds
  * ~~simple picture~~ :heavy_check_mark:
  * repeating pattern
  * ~~9 patch~~ :heavy_check_mark:
* Manage multiple sprites on screen
* Highlight the speaking character's sprite
* Manage audio
  * ~~Music~~ :heavy_check_mark:
  * SFX
* Fading music
* Animate sprite entries / exits
* WebGL?

## Contributions

Please feel free to create issues for new feature, enhancements or bugs. PRs are also welcome, obviously.  

### How to build

```sh
$> npm install
...

$> gulp build
...

$> ls dist/
visualnov-ink.js

```

## License

This software is released under MIT license (see the [LICENSE](/LICENSE) file for more information).
