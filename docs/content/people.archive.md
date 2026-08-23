# People on the archived F1TENTH about page

Source: <https://web.archive.org/web/20240109144454/https://f1tenth.org/about.html>, a 2024-01-09 snapshot. Local copy `_harvest/f1tenth-about-2024/about.html` with its 136 referenced files. Machine-readable version: `docs/content/people.archive.json`.

This file is a research artifact. It does not decide what the About page renders. `docs/content/people.crew.json` (A4) and `docs/content/people.past.json` (A5) own that.

## What the page is

Four tabs behind one Meet the Team heading: DEVELOPERS, ORGANIZERS, ALUMNI, PARTNERS, plus a fifth grid in the markup (`article#all`) that no nav button reaches. The people live in the first three and in the hidden grid. PARTNERS is logos only and belongs to the partner harvester, not here.

The word Alumni is that page's tab label. It is not used as a group in the output; those people are Past crew.

## The finding that changes the About page

Every F1TENTH project role on that page sits inside an HTML comment. The team wrote roles like Team Principal, Crew Chief and Outreach Director into the markup and then commented them out, together with the person's email. Readers never saw them. They are authored by the project and they are on a public URL, so they are a source, but they are a source that was deliberately hidden, and the reason is unknown.

So the twelve old-roster names that the pages-v2 contract said had no public source do now have one for two of them, Mike Coraluzzi (Head of Industry Relations) and, by the same route, several people who are not on the site at all. The name-only treatment still stands for the other ten: the page gives them nothing but a name, a photo and a LinkedIn link.

Recommendation: ask Cedric to accept or reject the comment-sourced roles as one block rather than one at a time. If he accepts, twenty-one people gain a real role line. If he rejects, nothing is lost because `role` and `role_source` sit in their own fields.

The other line the page renders under Alumni names is an employer, for example 'Software Engineer, WePay'. That is where a person worked in 2024, not a RoboRacer role, and it is two years stale. It is stored as `position_2024` and should not be printed as a role.

## Roles the page states (21)

| Person | Role | Group | Where the role comes from |
|---|---|---|---|
| Francesco Gatti | Organizer | Faculty and advisors | commented heading in `article#all` |
| Houssam Abbas | Formal Methods and Control Theory | Faculty and advisors | commented heading in `article#organizers` |
| Madhur Behl | Crew Chief | Faculty and advisors | commented heading in `article#organizers` |
| Marko Bertogna | Organizer | Faculty and advisors | commented heading in `article#organizers` |
| Paolo Burgio | Organizer | Faculty and advisors | commented heading in `article#organizers` |
| Rahul Mangharam | Team Principal | Faculty and advisors | commented heading in `article#organizers` |
| Venkat Krovi | Outreach Director | Faculty and advisors | commented heading in `article#organizers` |
| Billy Zheng | Simulation and Race Infrastructure | Crew | commented heading in `article#people` |
| Dhruv Karthik | Perception and Planning | Past crew | commented heading in `article#alumni` |
| Diana Hoang | Principal Web Developer and Designer | Past crew | commented heading in `article#alumni` |
| Joe Auckley | Stabilizer | Past crew | commented heading in `article#alumni` |
| Kaiying Guo | Past Principal Web Developer | Past crew | commented heading in `article#alumni` |
| Kim Luong | Education | Past crew | commented heading in `article#all` |
| Kuk Jang | Localization | Past crew | commented heading in `article#alumni` |
| Matthew Lebermann | Tire Changer | Past crew | commented heading in `article#alumni` |
| Matthew O'Kelly | Autonomous Driver | Past crew | commented heading in `article#alumni` |
| Mike Coraluzzi | Head of Industry Relations | Past crew | commented heading in `article#organizers` |
| Siddharth Singh | Perception | Past crew | commented heading in `article#alumni` |
| Susan Xie | Past Principal Designer | Past crew | commented heading in `article#alumni` |
| Varundev Sukhil | Autonomous Driver | Past crew | commented heading in `article#alumni` |
| Yuwei Wang | Learning and Control | Past crew | commented heading in `article#alumni` |

## Everyone found (61)

New means the name is absent from `public/data/team_developers.json` and `public/data/team_alumni.json`.

| Name | Group | Role | Employer line, 2024 | New | Archive photo | In repo | Staged | Link |
|---|---|---|---|---|---|---|---|---|
| Francesco Gatti | Faculty and advisors | Organizer | - | yes | `francesco_zRiQ.jpeg` | - | `francesco.jpeg` | [link](https://www.linkedin.com/in/francesco-gatti-5234aa163/) |
| Houssam Abbas | Faculty and advisors | Formal Methods and Control Theory | - | - | `houssam_zRiQ.png` | `public/crew/houssam-abbas-400.webp` | - | [link](https://www.linkedin.com/in/houssam-abbas-725642a/) |
| Madhur Behl | Faculty and advisors | Crew Chief | - | - | `madhur_zRiQ.jpg` | `public/crew/madhur-behl-400.webp` | - | [link](https://www.linkedin.com/in/madhurbehl/) |
| Marko Bertogna | Faculty and advisors | Organizer | - | - | `marko_zRiQ.jpg` | `public/crew/marko-bertogna-400.webp` | - | [link](https://www.linkedin.com/in/marko-bertogna-19bbb99/) |
| Paolo Burgio | Faculty and advisors | Organizer | - | - | `Paolo_Burgio_zRiQ.jpg` | `public/crew/paolo-burgio-400.webp` | - | [link](https://www.linkedin.com/in/paoloburgio/) |
| Rahul Mangharam | Faculty and advisors | Team Principal | - | - | `mangharam_zRiQ.jpeg` | `public/crew/rahul-mangharam-400.webp` | - | [link](https://www.linkedin.com/in/mangharam/) |
| Venkat Krovi | Faculty and advisors | Outreach Director | - | - | `venkatK_zRiQ.jpg` | `public/crew/venkat-krovi-400.webp` | - | [link](https://www.linkedin.com/in/venkatnkrovi/) |
| Billy Zheng | Crew | Simulation and Race Infrastructure | - | - | `billy_zRiQ.png` | `public/crew/billy-zheng-400.webp` | - | [link](https://www.linkedin.com/in/hongruizheng/) |
| Johannes Betz | Crew | - | - | - | `betz_zRiQ.jpeg` | `public/crew/johannes-betz-400.webp` | - | [link](https://www.linkedin.com/in/johannes-betz-254049107/) |
| Arnav Dhamija | Past crew | - | Software Engineer, Jugaad Lab | yes | `dhamja_zRiQ.jpeg` | - | `dhamja.jpeg` | [link](https://www.linkedin.com/in/arnav-dhamija/) |
| Baihong Zeng | Past crew | - | Vehicle Enginner, Nissan | yes | `zeng_zRiQ.jpeg` | - | `zeng.jpeg` | [link](https://www.linkedin.com/in/baihong-zeng-a5a3a512b/) |
| Brandon McBride | Past crew | - | - | yes | `Brandon_McBride_zRiQ.jpg` | - | `Brandon_McBride.jpg` | [link](https://www.linkedin.com/in/bmcb/) |
| Chris Kennedy | Past crew | - | - | yes | generic avatar | - | - | [link](https://www.linkedin.com/in/cwkenned/) |
| Christopher Kao | Past crew | - | Software Engineer, WePay | yes | `christopher_zRiQ.jpg` | - | `christopher.jpg` | [link](https://www.linkedin.com/in/christopher-kao/) |
| David DePauw | Past crew | - | - | yes | `David_DePauw_zRiQ.jpg` | - | `David_DePauw.jpg` | [link](https://www.linkedin.com/in/david-m-depauw/) |
| Dayong Tong | Past crew | - | - | yes | generic avatar | - | - | [link](https://www.linkedin.com/in/dayong-tong/) |
| Dhruv Karthik | Past crew | Perception and Planning | Software Enginner, Apple | yes | `dhruv_zRiQ.jpeg` | - | `dhruv.jpeg` | [link](https://www.linkedin.com/in/dhruvkarthik/) |
| Diana Hoang | Past crew | Principal Web Developer and Designer | Recruiting Support Staff, Oracle | yes | `dianah_zRiQ.jpg` | - | `dianah.jpg` | [link](https://www.linkedin.com/in/dnhoang/) |
| Jack Harkins | Past crew | - | System Software Engineer, NVIDIA | yes | `jack_zRiQ.jpg` | - | `jack.jpg` | [link](https://www.linkedin.com/in/jharkins95/) |
| Jalaj Maheshwari | Past crew | - | Research Engineer, Center for Injury Research and Prevention | yes | `jalaj_zRiQ.jpg` | - | `jalaj.jpg` | [link](https://www.linkedin.com/in/jalajmaheshwari/) |
| Jayanth Bhargav | Past crew | - | - | - | `bhargav_zRiQ.jpeg` | `public/crew/jayanth-bhargav-400.webp` | - | [link](https://www.linkedin.com/in/jayanthbhargav/) |
| Joe Auckley | Past crew | Stabilizer | Planning & Controls Software Engineer, Zoox | yes | `joe_auck_zRiQ.jpg` | - | `joe_auck.jpg` | [link](https://www.linkedin.com/in/joe-auckley-369b65130/) |
| Junfan Pan | Past crew | - | - | - | `Junfan_Pan_zRiQ.jpg` | `public/crew/junfan-pan-400.webp` | - | [link](https://www.linkedin.com/in/junfan-pan/) |
| Kaiying Guo | Past crew | Past Principal Web Developer | Software Enginner Intern, Facebook | yes | `kyg_zRiQ.jpg` | - | `kyg.jpg` | [link](https://www.linkedin.com/in/48kaiying/) |
| Karel Smejkal | Past crew | - | - | - | generic avatar | - | - | [link](https://www.linkedin.com/in/karel-smejkal/) |
| Kim Luong | Past crew | Education | - | yes | `kiml_zRiQ.jpg` | - | `kiml.jpg` | [link](https://www.linkedin.com/in/kim-luong-a0579542/) |
| Kuk Jang | Past crew | Localization | PhD Candidate, University of Pennsylvania | yes | `kuk_zRiQ.jpg` | - | `kuk.jpg` | [link](https://www.linkedin.com/in/kuk-jang-9a971014/) |
| Lejun Jiang | Past crew | - | - | - | generic avatar | - | - | [link](https://www.linkedin.com/in/lejun-jiang-a60274174/) |
| Malavika Manoj | Past crew | - | - | - | `Malavika_Manoj_zRiQ.jpg` | `public/crew/malavika-manoj-400.webp` | - | [link](https://www.linkedin.com/in/malavikamanoj/) |
| Manas Shukla | Past crew | - | Machine Learning Engineer, Universal Logic | yes | `manas_zRiQ.JPG` | - | `manas.JPG` | [link](https://www.linkedin.com/in/shuklam20/) |
| Matthew Brady | Past crew | - | HDE II Mechanical, Amazon Robotics | yes | `mattb_zRiQ.jpg` | - | `mattb.jpg` | [link](https://www.linkedin.com/in/matthew-brady-b4ab1656/) |
| Matthew Lebermann | Past crew | Tire Changer | Research Intern, University of Pennsylvania | yes | `pablo_zRiQ.png` | - | `pablo.png` | [link](https://www.linkedin.com/in/mleb/) |
| Matthew O'Kelly | Past crew | Autonomous Driver | Mechanical & Embedded Systems Enginner, Priority Designs | yes | `matt_zRiQ.jpg` | - | `matt.jpg` | [link](https://www.linkedin.com/in/meokelly/) |
| Mike Coraluzzi | Past crew | Head of Industry Relations | - | - | `mike_zRiQ.jpeg` | `public/crew/mike-coraluzzi-400.webp` | - | [link](https://www.linkedin.com/in/michael-coraluzzi-7433a846/) |
| Nagarakshith Makam Sreenivasulu | Past crew | - | - | yes | `Nagarakshith_Makam_Sreenivasulu_zRiQ.jpg` | - | `Nagarakshith_Makam_Sreenivasulu.jpg` | [link](https://www.linkedin.com/in/nagarakshith/) |
| Nischal K N | Past crew | - | Senior Autonomous Vehicle Software Engineer, NVIDIA | yes | `nischal_zRiQ.jpg` | - | `nischal.jpg` | [link](https://www.linkedin.com/in/nischalkn/) |
| Nitesh Singh | Past crew | - | Senior Embedded Software Engineer, Rivian | yes | `nitesh_zRiQ.JPG` | - | `nitesh.JPG` | [link](https://www.linkedin.com/in/nitesh06/) |
| Paril Jain | Past crew | - | Senior Autopilot Software Engineer, Tesla | yes | `paril_zRiQ.jpg` | - | `paril.jpg` | [link](https://www.linkedin.com/in/pariljain/) |
| Paritosh Kelkar | Past crew | - | Autonomous Vehicle Research Engineer, Honda R&D | yes | `paritosh_zRiQ.jpg` | - | `paritosh.jpg` | [link](https://www.linkedin.com/in/paritoshkelkar/) |
| Peter Werner | Past crew | - | Robotics, Institute for Dynamic Systems and Control | yes | `werner_zRiQ.jpeg` | - | `werner.jpeg` | [link](https://www.linkedin.com/in/wernerpe/) |
| Ravi Konkimalla | Past crew | - | - | - | `Ravi Konkimalla_zRiQ.jpg` | - | `Ravi_Konkimalla.jpg` | [link](https://www.linkedin.com/in/ravitejakonkimalla/) |
| Raymond Bjorkman | Past crew | - | - | yes | `Raymond_Bjorkman_zRiQ.jpg` | - | `Raymond_Bjorkman.jpg` | [link](https://www.linkedin.com/in/raybjork/) |
| Roshan Benefo | Past crew | - | - | - | `Roshan_Benefo_zRiQ.jpeg` | `public/crew/roshan-benefo-400.webp` | - | [link](https://www.linkedin.com/in/roshan-b-435296a3/) |
| Saumya Shah | Past crew | - | Autonomy Enginner, Skydio | yes | `shah_zRiQ.jpeg` | - | `shah.jpeg` | [link](https://www.linkedin.com/in/saumya97/) |
| Saurabh Kumthekar | Past crew | - | - | yes | generic avatar | - | - | [link](https://www.linkedin.com/in/saurabh-kumthekar/) |
| Siddharth Singh | Past crew | Perception | Software Engineer, Amazon | yes | `siddharth_zRiQ.jpg` | - | `siddharth.jpg` | [link](https://www.linkedin.com/in/siddharth-singh-764b49bb/) |
| Susan Xie | Past crew | Past Principal Designer | Tools Intern, Hi-Rez Studios | yes | `susan_zRiQ.png` | - | `susan.png` | [link](https://www.linkedin.com/in/susan-xie/) |
| Thejas Kesari | Past crew | - | Embedded Software Engineer, Rivian | yes | `thejas_zRiQ.JPG` | - | `thejas.JPG` | [link](https://www.linkedin.com/in/thejaskesari/) |
| Tom Jose | Past crew | - | - | - | `Tom_Jose_zRiQ.jpeg` | `public/crew/tom-jose-400.webp` | - | - |
| Trevor Pennypacker | Past crew | - | Cofounder, Paladin Drones | yes | `trevor_zRiQ.png` | - | `trevor.png` | [link](https://www.linkedin.com/in/trevor-pennypacker/) |
| Tuan Nguyen | Past crew | - | - | yes | generic avatar | - | - | - |
| Varundev Sukhil | Past crew | Autonomous Driver | Product Engineer, Scanoptix | yes | `varundev_zRiQ.png` | - | `varundev.png` | [link](https://www.linkedin.com/in/varundev-sukhil-2aa340109/) |
| Venkat Varun Velpula | Past crew | - | - | yes | `Venkat_Varun_Velpula_zRiQ.JPG` | - | `Venkat_Varun_Velpula.JPG` | [link](https://www.linkedin.com/in/varun-velpula/) |
| Wesley Yee | Past crew | - | - | - | generic avatar | - | - | [link](https://www.linkedin.com/in/wesley-yee/) |
| Xiaozhou Zhang | Past crew | - | - | - | `zhang_zRiQ.jpg` | `public/crew/xiaozhou-zhang-400.webp` | - | [link](https://www.linkedin.com/in/xiaozhou-zhang-91760b13a/) |
| Xinlong Zheng | Past crew | - | - | - | `zheng_zRiQ.jpeg` | `public/crew/xinlong-zheng-400.webp` | - | [link](https://www.linkedin.com/in/xinlong-zheng-47092316a/) |
| Yash Pant | Past crew | - | Postdoctoral Fellow, UC Berkeley | yes | `YashPant_zRiQ.jpg` | - | `YashPant.jpg` | [link](https://yashpant.github.io/) |
| Yash Trikannad | Past crew | - | Software Enginner, Motional | yes | `trikannad_zRiQ.jpeg` | - | `trikannad.jpeg` | [link](https://www.linkedin.com/in/yash-trikannad/) |
| Yuwei Wang | Past crew | Learning and Control | Applied Scientist, Amazon | yes | `wang_zRiQ.jpeg` | - | `wang.jpeg` | [link](https://www.linkedin.com/in/yuwei-wang-956a68152/) |
| Zhihao Ruan | Past crew | - | - | yes | generic avatar | - | - | [link](https://www.linkedin.com/in/zhihao-ruan-29b29a13a/) |
| Zirui Zang | Past crew | - | Imaging Science, PerkinElmer | yes | `zang_zRiQ.jpeg` | - | `zang.jpeg` | [link](https://www.linkedin.com/in/zirui-zang/) |

## Headshots staged (37)

Copied to `_harvest/pick/crew/` with the Wayback `_zRiQ` suffix stripped and spaces replaced by underscores. Every one is a distinct file; no two people share an image. The About builder encodes and installs them, this agent does not write `public/crew/`.

```
Francesco Gatti                    francesco.jpeg
Arnav Dhamija                      dhamja.jpeg
Baihong Zeng                       zeng.jpeg
Brandon McBride                    Brandon_McBride.jpg
Christopher Kao                    christopher.jpg
David DePauw                       David_DePauw.jpg
Dhruv Karthik                      dhruv.jpeg
Diana Hoang                        dianah.jpg
Jack Harkins                       jack.jpg
Jalaj Maheshwari                   jalaj.jpg
Joe Auckley                        joe_auck.jpg
Kaiying Guo                        kyg.jpg
Kim Luong                          kiml.jpg
Kuk Jang                           kuk.jpg
Manas Shukla                       manas.JPG
Matthew Brady                      mattb.jpg
Matthew Lebermann                  pablo.png
Matthew O'Kelly                    matt.jpg
Nagarakshith Makam Sreenivasulu    Nagarakshith_Makam_Sreenivasulu.jpg
Nischal K N                        nischal.jpg
Nitesh Singh                       nitesh.JPG
Paril Jain                         paril.jpg
Paritosh Kelkar                    paritosh.jpg
Peter Werner                       werner.jpeg
Ravi Konkimalla                    Ravi_Konkimalla.jpg
Raymond Bjorkman                   Raymond_Bjorkman.jpg
Saumya Shah                        shah.jpeg
Siddharth Singh                    siddharth.jpg
Susan Xie                          susan.png
Thejas Kesari                      thejas.JPG
Trevor Pennypacker                 trevor.png
Varundev Sukhil                    varundev.png
Venkat Varun Velpula               Venkat_Varun_Velpula.JPG
Yash Pant                          YashPant.jpg
Yash Trikannad                     trikannad.jpeg
Yuwei Wang                         wang.jpeg
Zirui Zang                         zang.jpeg
```

## No headshot (8)

The page used its generic avatar GIF for these. They need a monogram tile or a photo from elsewhere: Chris Kennedy, Dayong Tong, Karel Smejkal, Lejun Jiang, Saurabh Kumthekar, Tuan Nguyen, Wesley Yee, Zhihao Ruan.

## Things to check before publishing

- Matthew O'Kelly's rendered employer line reads 'Mechanical & Embedded Systems Enginner, Priority Designs'. He co-authored the platform papers out of Penn, so that line looks like it belongs to someone else or is very old. The hidden grid gives him the project role Autonomous Driver instead. Do not print the employer line without Cedric.
- Yuwei Wang appears twice with two different photos, `wang_zRiQ.jpeg` in the visible Alumni tab and `yuwei_zRiQ.jpg` in the hidden grid. The Alumni one is used here.
- The hidden grid writes Kuk Jang as 'Kuk Jin'. Same LinkedIn profile, same photo. The visible spelling is kept.
- Christopher Kao has two employer lines that disagree, WePay in the visible tab and Built Robotics in the hidden grid. Neither is a RoboRacer role.
- Nitesh Singh, Matthew Brady, Jack Harkins, Paril Jain, Paritosh Kelkar, Thejas Kesari, Jalaj Maheshwari, Nischal K N, Trevor Pennypacker and Manas Shukla have employer strings in their comments, not project roles. They are recorded as `position_2024` and their `role` is null.
- The page's own copy calls the project 'F1TENTH' throughout and gives contact@f1tenth.org. Neither goes on the new site.
- Photo to person mapping was done by DOM proximity inside each `col-lg-3` block, never by file order, because that page interleaves partner logos with headshots in the file list. Two spot checks were opened as images and both are real, distinct headshots.
