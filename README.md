# Introduction
Planks and Flanks is a roguelike multiplayer shooting game inspired by Fortnite. You control a character to obtain resources to survive the storm.

The code was written in Node.JS and was written over a week.

Credits to my sister for designing the assets!

## Running the Game

Unfortunately, the original app has since been removed from the Heroku website following the closure of Heroku's free tier.

To run the game, you need to have `npm` and `node` installed. Install them [here](https://nodejs.org/en).

Clone the repository to your computer with `git clone https://github.com/GabeeDeVera/planks-and-flanks.git`. Then cd into the generated directory with `cd planks-and-flanks`.

Then, execute:
1. `npm init`
2. `node server.js`

In the console, you should see a localhost link printed.

You may join that link in multiple tabs. Each tab is a separate player.

I believe it is possible to temporarily run the server from your computer and have other players join using port forwarding. Better yet, if you have your own server, you may run this program on that server.

## Introduction to the Survivors' Guide

What follows below is a guide to the game I wrote in 2022. As a disclaimer, I asked Gemini to combine the contents from the relevant HTML files and reformat them into markdown while preserving the exact content.

---
# The Survivors' Guide

## Introduction

*Welcome, traveler!* You and some of your crewmates have been **marooned on an island** after **starting a mutiny against your captain**. This island is not just any island. Legend has it that this island **experiences a deadly acidic storm** at certain times of the year. You and your crew have decided to **set-up camp near the edge of the island**; however, **your supplies started to diminish** and over time, **you and your crewmates started to go crazy**. One day, **the storm hit the island** and **scattered all of the supplies around the island**. Because of this, **you and your crewmates turned insane** and **started to turn against each other**.

*Will you be able to survive before the storm comes back?*

---

# Home Page and Lobby

## Home Page

![](/images/homePage1.png)

This is the **home page**. This is where you can **create or join a game**. You can also set your **in-game name** here.

### Creating a Room

![](/images/createRoom1.png)

To **create a room**, go to the **right side of your screen** and **type in your in-game name at the top and type the name that you want for your room in the second input box**.

![](/images/createRoom2.png)
![](/images/createRoom3.png)

In the example on the left, the username set is TestUsername and the room name is TestingRoom.

Finally, you should **set a map size in the last input box**. The map size is a **number from 10 to 100 that measures the side length of a map**. A map size of 10 corresponds to a 10 by 10 map, a map size of 11 corresponds to a 11 by 11 map, and so on. Below is a list of recommended map sizes:

| Number of Players | Recommended map size |
| --- | --- |
| < 4 | 20 |
| 4 - 6 | 30 |
| > 6 | 50 |

![](/images/createRoom4.png)

> Make sure to type the **number only** (ex. Instead of typing 10x10, type 10 instead).

### Joining a Room

The other option to play a game is to **join a room that someone else has created**. To do this go to the **left side of your screen** and **type your preferred in-game name**. You also have to **type in the code** for the room that you will join. You **can get the code from the host of the game**.

The code is **made up of 4 alphanumeric characters** (along with a hyphen and an underscore). If you are the host, **you can find the code here**:

![](/images/joinRoom1.png)

If you are the host, you can also **copy the link and send it** to the other players.

If you are not the host, **ask the host for the code** and **input it in the first input box** (refer to the image below).

![](/images/joinRoom2.png)

In this example, the code is **sdmz**. Note that the code is **case-sensitive** (i.e. capitalization matters). After inputting the code, **click the join button to go into the room**. Once you click join, your screen should look somewhat like this:

![](/images/joinRoom3.png)

> Make sure to check the **capitalization** of the **room code**. If the letters **differ in capitalization**, it **will not work**.

> If you are the host, please **click the start button once everyone has joined so that the game can start**.
>
> ![](/images/joinRoom4.png)

> Make sure that you **do not provide any information that other people could use to identify you in real life**.

---

# Game Objective and Controls

## Objective

The objective of the game is simple: **you have to be the last person standing**. The game is **turn-based**; that is, **each player can only move around, shoot, and build if it is their turn**.

## Controls

The controls are **bound to certain keys** on the keyboard.

To **move around**, use the **WASD keys**. Below are detailed descriptions of what each of these keys do:

| Key | Function |
| --- | --- |
| W | Move Up |
| A | Move Left |
| S | Move Down |
| D | Move Right |

**Clicking one of these keys will result in the end of your turn**.

To **face a certain direction**, press the **arrow keys** (↑, ←, ↓, →, ). Below are detailed descriptions about what each of these keys do:

| Key | Function |
| --- | --- |
| ↑ | Turn Up |
| ← | Turn Left |
| ↓ | Turn Down |
| → | Turn Right |

**Clicking one of these keys will NOT result in the end of your turn**.

To **build a wall in the direction that you are facing**, press **B**.

To **shoot a bullet in the direction that you are facing**, press the **spacebar**.

To **skip a move**, press **enter**.

**Pressing B, the spacebar, or enter will result in the end of your turn**.

---

# Game Mechanics

## Player Stats

Every player has 4 stats that the game keeps track of, namely: **HP**, **Wood**, **Ammo**, and **Gun**.

**HP** stands for **"hit points"**. It represents the **number of health points** that you have. The **lower the HP**, the **less health** you have. If this **value drops to 0** (or a negative value), **you will die** and be **sent back to the lobby**. All players **start with 5 HP**.

**Wood** represents the **number of wood planks** that you have obtained. You can use a wood plank to **build walls** around you. **Walls prevent bullets from hitting you**. **Players cannot move through walls**. **Walls can be destroyed** by a **bullet**.

**Ammo** represents the **number of bullets** that you have. **You need ammo (and a gun) to shoot a bullet**. **Shooting a bullet** will **consume one ammo**.

**Gun** represents **whether or not you have a gun**. **If you have a gun and some ammo, you can shoot a bullet**. You can only have one gun.

## Biomes

There are three different biomes in the game as of now. These biomes are: **Desert**, **Plains**, and **Snow**.

### Plains Biome

![](/images/plainsBiome1.png)

**Plains biomes** are areas **filled with lush vegetation and loot**. They **do not contain as much loot as desert biomes**; however, unlike desert biomes, they **do not inflict damage** if you move around them.

### Desert Biome

![](/images/desertBiome1.png)

**Desert biomes** are **hot, dry areas** that **contain more loot than usual**; however, there is a **5% chance that you will lose 1 HP if you move in a desert biome**.

The tiles with a purple swirl on them are known as **storm tiles**. They **inflict damage upon players and approach the center of the map**. You will learn about the storm in a later entry in the survivors' guide.

> Be careful when travelling around a desert biome. If you do not pay attention to you **HP**, you may die.

### Snow Biome

![](/images/snowBiome1.png)

**Snow biomes** are **cold areas** that **do not contain any loot**; however, unlike the other biomes, **snow biomes contain medical kits** that will **increase your HP by one** (you can surpass 5 HP). Snow biomes **do not inflict damage upon the player**.

> Generally, it is a good idea to **increase your HP before attempting to get loot in a desert biome**. HP is also **really important in the end game**.

## Items

There are 5 different collectible items, namely: **Ammo**, **Gun**, **Wood**, and **Med kits**.

### Ammo

![](/images/ammo.svg)

**Ammo** serves as a **projectile for the gun**. It allows you to **shoot bullets** using a gun. **Shooting a bullet reduces the number of ammo** that you have by **1**. Ammo **can be found in any biome except for snow biomes**.

### Gun

![](/images/gun.svg)

**Guns** allow you to **shoot the ammo** that you have accumulated over the course of the game. **Shooting will deploy a bullet** in the **direction that you are facing**, and the **bullet will continue to move in that direction every turn** until it **hits a player, a wall, or the edge of the map**. You **can only have 1 gun**. Guns can be **found in any biome** except for snow biomes.

### Wood

![](/images/wood.svg)
![](/images/cactus.svg)

**Wood** allows you to **build walls** to **defend yourself against the attacks of other players**. Wood **can be found in any biome except for snow biomes**. Wood can be **found in plains and desert biomes** in the form of **logs and cacti**, respectively.

### Med Kits

![](/images/medkit.svg)

**Med kits** allow you to **increase your HP by 1**. This can **allow you to reach HP levels above 5**. Med kits **can only be found in snow biomes**.

## The Storm

![](/images/storm1.png)
![](/images/storm.png)

**The storm inflicts one HP worth of damage per turn**. **Tiles that are engulfed** by the storm are shown with a **transparent purple swirl**. The storm **approaches from the edges of the map** and slowly **grows and approaches the center**. Once the storm shrinks to a size of 3x3 (for odd map sizes) or 2x2 (for even map sizes), it stops for a while; however, after a while, the storm will continue growing and will eventually engulf everything and everyone. The storm **does not destroy walls or loot**. It only inflicts damage upon players.

> **Be very careful**. The storm is **more deadly than a bullet** shot from a gun because it **inflicts continuous damage upon players**.