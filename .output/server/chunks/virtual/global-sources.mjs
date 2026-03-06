const sources = [
    {
        "context": {
            "name": "sitemap:urls",
            "description": "Set with the `sitemap.urls` config."
        },
        "urls": [
            {
                "url": "/",
                "changefreq": "daily"
            },
            {
                "url": "/fixture-editor",
                "changefreq": "monthly"
            },
            {
                "url": "/import-fixture-file",
                "changefreq": "monthly"
            },
            {
                "url": "/manufacturers",
                "changefreq": "monthly"
            },
            {
                "url": "/categories",
                "changefreq": "monthly"
            },
            {
                "url": "/about",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins",
                "changefreq": "monthly"
            },
            {
                "url": "/rdm",
                "changefreq": "yearly"
            },
            {
                "url": "/search",
                "changefreq": "yearly"
            },
            {
                "url": "/5star-systems",
                "changefreq": "weekly"
            },
            {
                "url": "/5star-systems/spica-250m",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/abstract",
                "changefreq": "weekly"
            },
            {
                "url": "/abstract/twister-4",
                "changefreq": "monthly",
                "lastmod": "2022-05-03T00:00:00.000Z"
            },
            {
                "url": "/acoustic-control",
                "changefreq": "weekly"
            },
            {
                "url": "/acoustic-control/par-180-cob-3in1",
                "changefreq": "monthly",
                "lastmod": "2019-07-31T00:00:00.000Z"
            },
            {
                "url": "/adb",
                "changefreq": "weekly"
            },
            {
                "url": "/adb/alc4",
                "changefreq": "monthly",
                "lastmod": "2018-08-24T00:00:00.000Z"
            },
            {
                "url": "/adb/europe-105",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/adb/warp-m",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/afx",
                "changefreq": "weekly"
            },
            {
                "url": "/afx/lmh460z",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/alien-pro",
                "changefreq": "weekly"
            },
            {
                "url": "/alien-pro/alien-s",
                "changefreq": "monthly",
                "lastmod": "2022-01-29T00:00:00.000Z"
            },
            {
                "url": "/american-dj",
                "changefreq": "weekly"
            },
            {
                "url": "/american-dj/7p-hex-ip",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/american-dj/12p-hex-ip",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/american-dj/18p-hex-ip",
                "changefreq": "monthly",
                "lastmod": "2022-03-27T00:00:00.000Z"
            },
            {
                "url": "/american-dj/auto-spot-150",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/american-dj/boom-box-fx2",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/american-dj/cob-cannon-wash",
                "changefreq": "monthly",
                "lastmod": "2019-07-18T00:00:00.000Z"
            },
            {
                "url": "/american-dj/crazy-pocket-8",
                "changefreq": "monthly",
                "lastmod": "2019-05-08T00:00:00.000Z"
            },
            {
                "url": "/american-dj/dekker-led",
                "changefreq": "monthly",
                "lastmod": "2019-05-08T00:00:00.000Z"
            },
            {
                "url": "/american-dj/dotz-par",
                "changefreq": "monthly",
                "lastmod": "2021-09-13T00:00:00.000Z"
            },
            {
                "url": "/american-dj/encore-lp12z-ip",
                "changefreq": "monthly",
                "lastmod": "2024-09-12T00:00:00.000Z"
            },
            {
                "url": "/american-dj/encore-profile-1000-ww",
                "changefreq": "monthly",
                "lastmod": "2019-02-27T00:00:00.000Z"
            },
            {
                "url": "/american-dj/flat-par-qa12",
                "changefreq": "monthly",
                "lastmod": "2022-03-20T00:00:00.000Z"
            },
            {
                "url": "/american-dj/flat-par-qa12xs",
                "changefreq": "monthly",
                "lastmod": "2022-03-20T00:00:00.000Z"
            },
            {
                "url": "/american-dj/fog-fury-jett-pro",
                "changefreq": "monthly",
                "lastmod": "2018-11-26T00:00:00.000Z"
            },
            {
                "url": "/american-dj/galaxian-3d",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/american-dj/illusion-dotz-4-4",
                "changefreq": "monthly",
                "lastmod": "2019-10-30T00:00:00.000Z"
            },
            {
                "url": "/american-dj/inno-pocket-beam-q4",
                "changefreq": "monthly",
                "lastmod": "2019-02-15T00:00:00.000Z"
            },
            {
                "url": "/american-dj/inno-pocket-fusion",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/american-dj/inno-spot-pro",
                "changefreq": "monthly",
                "lastmod": "2026-02-26T00:00:00.000Z"
            },
            {
                "url": "/american-dj/mega-bar-50rgb",
                "changefreq": "monthly",
                "lastmod": "2019-12-13T00:00:00.000Z"
            },
            {
                "url": "/american-dj/mega-bar-50rgb-rc",
                "changefreq": "monthly",
                "lastmod": "2019-12-13T00:00:00.000Z"
            },
            {
                "url": "/american-dj/mega-bar-rgba",
                "changefreq": "monthly",
                "lastmod": "2018-12-10T00:00:00.000Z"
            },
            {
                "url": "/american-dj/mega-hex-par",
                "changefreq": "monthly",
                "lastmod": "2024-01-08T00:00:00.000Z"
            },
            {
                "url": "/american-dj/mega-par-profile-plus",
                "changefreq": "monthly",
                "lastmod": "2026-01-28T00:00:00.000Z"
            },
            {
                "url": "/american-dj/mega-tripar-profile",
                "changefreq": "monthly",
                "lastmod": "2025-03-25T00:00:00.000Z"
            },
            {
                "url": "/american-dj/mega-tripar-profile-plus",
                "changefreq": "monthly",
                "lastmod": "2019-07-11T00:00:00.000Z"
            },
            {
                "url": "/american-dj/mod-hex100",
                "changefreq": "monthly",
                "lastmod": "2023-04-24T00:00:00.000Z"
            },
            {
                "url": "/american-dj/pocket-pro",
                "changefreq": "monthly",
                "lastmod": "2019-03-16T00:00:00.000Z"
            },
            {
                "url": "/american-dj/quad-phase-hp",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/american-dj/revo-4-ir",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/american-dj/revo-burst",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/american-dj/revo-sweep",
                "changefreq": "monthly",
                "lastmod": "2018-08-24T00:00:00.000Z"
            },
            {
                "url": "/american-dj/saber-spot-rgbw",
                "changefreq": "monthly",
                "lastmod": "2018-11-01T00:00:00.000Z"
            },
            {
                "url": "/american-dj/starburst",
                "changefreq": "monthly",
                "lastmod": "2019-03-03T00:00:00.000Z"
            },
            {
                "url": "/american-dj/stinger-ii",
                "changefreq": "monthly",
                "lastmod": "2019-04-07T00:00:00.000Z"
            },
            {
                "url": "/american-dj/stinger-spot",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/american-dj/ultra-hex-bar-12",
                "changefreq": "monthly",
                "lastmod": "2026-01-28T00:00:00.000Z"
            },
            {
                "url": "/american-dj/uv-eco-bar",
                "changefreq": "monthly",
                "lastmod": "2024-09-11T00:00:00.000Z"
            },
            {
                "url": "/american-dj/vbar-pak",
                "changefreq": "monthly",
                "lastmod": "2022-04-03T00:00:00.000Z"
            },
            {
                "url": "/american-dj/vizi-q-wash7",
                "changefreq": "monthly",
                "lastmod": "2023-04-25T00:00:00.000Z"
            },
            {
                "url": "/american-dj/vizi-spot-led-pro",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/american-dj/xs-400",
                "changefreq": "monthly",
                "lastmod": "2019-05-17T00:00:00.000Z"
            },
            {
                "url": "/ape-labs",
                "changefreq": "weekly"
            },
            {
                "url": "/ape-labs/lightcan",
                "changefreq": "monthly",
                "lastmod": "2019-05-30T00:00:00.000Z"
            },
            {
                "url": "/aputure",
                "changefreq": "weekly"
            },
            {
                "url": "/aputure/ls-300x",
                "changefreq": "monthly",
                "lastmod": "2022-05-07T00:00:00.000Z"
            },
            {
                "url": "/aputure/ls-600d",
                "changefreq": "monthly",
                "lastmod": "2022-09-24T00:00:00.000Z"
            },
            {
                "url": "/aputure/ls-600d-pro",
                "changefreq": "monthly",
                "lastmod": "2022-09-24T00:00:00.000Z"
            },
            {
                "url": "/aputure/ls-600x-pro",
                "changefreq": "monthly",
                "lastmod": "2022-09-24T00:00:00.000Z"
            },
            {
                "url": "/aputure/ls-1200d-pro",
                "changefreq": "monthly",
                "lastmod": "2022-09-24T00:00:00.000Z"
            },
            {
                "url": "/aputure/nova-p300c",
                "changefreq": "monthly",
                "lastmod": "2022-05-07T00:00:00.000Z"
            },
            {
                "url": "/arri",
                "changefreq": "weekly"
            },
            {
                "url": "/arri/broadcaster-2-plus",
                "changefreq": "monthly",
                "lastmod": "2019-08-26T00:00:00.000Z"
            },
            {
                "url": "/arri/l5-c",
                "changefreq": "monthly",
                "lastmod": "2020-09-21T00:00:00.000Z"
            },
            {
                "url": "/arri/l7-c",
                "changefreq": "monthly",
                "lastmod": "2020-09-21T00:00:00.000Z"
            },
            {
                "url": "/arri/l10-c",
                "changefreq": "monthly",
                "lastmod": "2020-09-21T00:00:00.000Z"
            },
            {
                "url": "/arri/skypanel-s30c",
                "changefreq": "monthly",
                "lastmod": "2021-09-13T00:00:00.000Z"
            },
            {
                "url": "/arri/skypanel-s60c",
                "changefreq": "monthly",
                "lastmod": "2020-10-02T00:00:00.000Z"
            },
            {
                "url": "/arri/skypanel-s120c",
                "changefreq": "monthly",
                "lastmod": "2020-10-02T00:00:00.000Z"
            },
            {
                "url": "/arri/skypanel-s360c",
                "changefreq": "monthly",
                "lastmod": "2020-10-02T00:00:00.000Z"
            },
            {
                "url": "/astera",
                "changefreq": "weekly"
            },
            {
                "url": "/astera/ax3-lightdrop",
                "changefreq": "monthly",
                "lastmod": "2020-03-29T00:00:00.000Z"
            },
            {
                "url": "/astera/fp1-titan-tube",
                "changefreq": "monthly",
                "lastmod": "2021-01-11T00:00:00.000Z"
            },
            {
                "url": "/astera/fp2-helios-tube",
                "changefreq": "monthly",
                "lastmod": "2021-01-11T00:00:00.000Z"
            },
            {
                "url": "/astera/fp3-hyperion-tube",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/astera/fp5-nyx-bulb",
                "changefreq": "monthly",
                "lastmod": "2021-01-12T00:00:00.000Z"
            },
            {
                "url": "/audibax",
                "changefreq": "weekly"
            },
            {
                "url": "/audibax/boston-60",
                "changefreq": "monthly",
                "lastmod": "2020-12-12T00:00:00.000Z"
            },
            {
                "url": "/ayra",
                "changefreq": "weekly"
            },
            {
                "url": "/ayra/compar-20",
                "changefreq": "monthly",
                "lastmod": "2024-03-05T00:00:00.000Z"
            },
            {
                "url": "/ayra/tdc-triple-burst",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/ayrton",
                "changefreq": "weekly"
            },
            {
                "url": "/ayrton/diablo-s",
                "changefreq": "monthly",
                "lastmod": "2019-07-24T00:00:00.000Z"
            },
            {
                "url": "/ayrton/diablo-tc",
                "changefreq": "monthly",
                "lastmod": "2019-07-24T00:00:00.000Z"
            },
            {
                "url": "/ayrton/magicblade-fx",
                "changefreq": "monthly",
                "lastmod": "2018-08-24T00:00:00.000Z"
            },
            {
                "url": "/beamz",
                "changefreq": "weekly"
            },
            {
                "url": "/beamz/h2000-faze-machine",
                "changefreq": "monthly",
                "lastmod": "2019-02-21T00:00:00.000Z"
            },
            {
                "url": "/beamz/panther-7r",
                "changefreq": "monthly",
                "lastmod": "2019-12-27T00:00:00.000Z"
            },
            {
                "url": "/beamz/pls25-par",
                "changefreq": "monthly",
                "lastmod": "2020-03-28T00:00:00.000Z"
            },
            {
                "url": "/beamz/triple-flex-centre-pro-led",
                "changefreq": "monthly",
                "lastmod": "2019-10-02T00:00:00.000Z"
            },
            {
                "url": "/big-dipper",
                "changefreq": "weekly"
            },
            {
                "url": "/big-dipper/lp001",
                "changefreq": "monthly",
                "lastmod": "2019-08-26T00:00:00.000Z"
            },
            {
                "url": "/big-dipper/ls90",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/bitfocus",
                "changefreq": "weekly"
            },
            {
                "url": "/bitfocus/companion-v2",
                "changefreq": "monthly",
                "lastmod": "2023-05-06T00:00:00.000Z"
            },
            {
                "url": "/blizzard",
                "changefreq": "weekly"
            },
            {
                "url": "/blizzard/hotbox-exa",
                "changefreq": "monthly",
                "lastmod": "2022-04-03T00:00:00.000Z"
            },
            {
                "url": "/blizzard/hotbox-rgbw",
                "changefreq": "monthly",
                "lastmod": "2022-04-11T00:00:00.000Z"
            },
            {
                "url": "/blizzard/puck-rgbaw",
                "changefreq": "monthly",
                "lastmod": "2018-08-06T00:00:00.000Z"
            },
            {
                "url": "/blizzard/rokbox-rgbw",
                "changefreq": "monthly",
                "lastmod": "2019-02-27T00:00:00.000Z"
            },
            {
                "url": "/boomtonedj",
                "changefreq": "weekly"
            },
            {
                "url": "/boomtonedj/crazy-spot-30",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/boomtonedj/silentpar-5x3w-3in1",
                "changefreq": "monthly",
                "lastmod": "2019-07-22T00:00:00.000Z"
            },
            {
                "url": "/boomtonedj/silentpar-5x10w-5in1",
                "changefreq": "monthly",
                "lastmod": "2019-07-22T00:00:00.000Z"
            },
            {
                "url": "/boomtonedj/silentpar-5x10w-6in1",
                "changefreq": "monthly",
                "lastmod": "2019-07-22T00:00:00.000Z"
            },
            {
                "url": "/boomtonedj/silentpar-7x3w-3in1",
                "changefreq": "monthly",
                "lastmod": "2019-07-22T00:00:00.000Z"
            },
            {
                "url": "/boomtonedj/silentpar-7x10w-5in1",
                "changefreq": "monthly",
                "lastmod": "2019-07-22T00:00:00.000Z"
            },
            {
                "url": "/boomtonedj/silentpar-7x10w-6in1",
                "changefreq": "monthly",
                "lastmod": "2019-07-22T00:00:00.000Z"
            },
            {
                "url": "/boomtonedj/silentpar-12x3w-3in1",
                "changefreq": "monthly",
                "lastmod": "2019-07-22T00:00:00.000Z"
            },
            {
                "url": "/boomtonedj/silentpar-12x10w-5in1",
                "changefreq": "monthly",
                "lastmod": "2019-07-22T00:00:00.000Z"
            },
            {
                "url": "/boomtonedj/silentpar-12x10w-6in1",
                "changefreq": "monthly",
                "lastmod": "2019-07-22T00:00:00.000Z"
            },
            {
                "url": "/boomtonedj/xtrem-led",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/briteq",
                "changefreq": "weekly"
            },
            {
                "url": "/briteq/beam-fury-1",
                "changefreq": "monthly",
                "lastmod": "2023-05-13T00:00:00.000Z"
            },
            {
                "url": "/briteq/beamspot1-dmx-fc",
                "changefreq": "monthly",
                "lastmod": "2020-01-14T00:00:00.000Z"
            },
            {
                "url": "/briteq/bt-coloray-18fcr",
                "changefreq": "monthly",
                "lastmod": "2019-03-06T00:00:00.000Z"
            },
            {
                "url": "/briteq/bt-coloray-60r",
                "changefreq": "monthly",
                "lastmod": "2019-03-06T00:00:00.000Z"
            },
            {
                "url": "/briteq/bt-coloray-120r",
                "changefreq": "monthly",
                "lastmod": "2019-03-06T00:00:00.000Z"
            },
            {
                "url": "/briteq/bt-ledrotor",
                "changefreq": "monthly",
                "lastmod": "2018-12-11T00:00:00.000Z"
            },
            {
                "url": "/briteq/bt-stagepar-6in1",
                "changefreq": "monthly",
                "lastmod": "2019-10-13T00:00:00.000Z"
            },
            {
                "url": "/briteq/btx-cirrus-ii",
                "changefreq": "monthly",
                "lastmod": "2022-04-11T00:00:00.000Z"
            },
            {
                "url": "/briteq/btx-titan",
                "changefreq": "monthly",
                "lastmod": "2020-03-28T00:00:00.000Z"
            },
            {
                "url": "/briteq/cob-slim-100-rgb",
                "changefreq": "monthly",
                "lastmod": "2018-12-11T00:00:00.000Z"
            },
            {
                "url": "/briteq/pro-beamer-zoom-indoor",
                "changefreq": "monthly",
                "lastmod": "2019-04-02T00:00:00.000Z"
            },
            {
                "url": "/briteq/pro-beamer-zoom-outdoor",
                "changefreq": "monthly",
                "lastmod": "2019-04-02T00:00:00.000Z"
            },
            {
                "url": "/cameo",
                "changefreq": "weekly"
            },
            {
                "url": "/cameo/auro-beam-150",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/cameo/auro-spot-100",
                "changefreq": "monthly",
                "lastmod": "2019-02-08T00:00:00.000Z"
            },
            {
                "url": "/cameo/auro-spot-200",
                "changefreq": "monthly",
                "lastmod": "2019-02-08T00:00:00.000Z"
            },
            {
                "url": "/cameo/auro-spot-300",
                "changefreq": "monthly",
                "lastmod": "2019-02-08T00:00:00.000Z"
            },
            {
                "url": "/cameo/auro-spot-400",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/cameo/auro-spot-z300",
                "changefreq": "monthly",
                "lastmod": "2026-01-28T00:00:00.000Z"
            },
            {
                "url": "/cameo/flash-matrix-250",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/cameo/flat-par-can-rgb-10-ir",
                "changefreq": "monthly",
                "lastmod": "2024-10-01T00:00:00.000Z"
            },
            {
                "url": "/cameo/flat-par-can-tri-5x-3w-ir",
                "changefreq": "monthly",
                "lastmod": "2019-03-06T00:00:00.000Z"
            },
            {
                "url": "/cameo/flat-par-can-tri-7x-3w-ir",
                "changefreq": "monthly",
                "lastmod": "2024-09-30T00:00:00.000Z"
            },
            {
                "url": "/cameo/flat-pro-18",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/cameo/flat-pro-flood-600-ip65",
                "changefreq": "monthly",
                "lastmod": "2021-12-03T00:00:00.000Z"
            },
            {
                "url": "/cameo/flat-pro-flood-ip65-tri",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/cameo/gobo-scanner-80",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/cameo/hydrabeam-100",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/cameo/hydrabeam-300-rgbw",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/cameo/hydrabeam-400-rgbw",
                "changefreq": "monthly",
                "lastmod": "2023-10-24T00:00:00.000Z"
            },
            {
                "url": "/cameo/instant-air-1000-pro",
                "changefreq": "monthly",
                "lastmod": "2019-07-31T00:00:00.000Z"
            },
            {
                "url": "/cameo/instant-air-2000-pro",
                "changefreq": "monthly",
                "lastmod": "2019-07-31T00:00:00.000Z"
            },
            {
                "url": "/cameo/instant-hazer-1500-t-pro",
                "changefreq": "monthly",
                "lastmod": "2022-07-19T00:00:00.000Z"
            },
            {
                "url": "/cameo/ioda-400-rgy",
                "changefreq": "monthly",
                "lastmod": "2019-08-21T00:00:00.000Z"
            },
            {
                "url": "/cameo/ioda-600-rgb",
                "changefreq": "monthly",
                "lastmod": "2019-08-21T00:00:00.000Z"
            },
            {
                "url": "/cameo/ioda-1000-rgb",
                "changefreq": "monthly",
                "lastmod": "2019-08-21T00:00:00.000Z"
            },
            {
                "url": "/cameo/multi-fx-bar",
                "changefreq": "monthly",
                "lastmod": "2019-05-17T00:00:00.000Z"
            },
            {
                "url": "/cameo/multi-par-cob-1",
                "changefreq": "monthly",
                "lastmod": "2019-11-27T00:00:00.000Z"
            },
            {
                "url": "/cameo/nanospot-120",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/cameo/outdoor-par-tri-12",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/cameo/q-spot-40-cw",
                "changefreq": "monthly",
                "lastmod": "2024-10-09T00:00:00.000Z"
            },
            {
                "url": "/cameo/q-spot-40-rgbw",
                "changefreq": "monthly",
                "lastmod": "2022-11-07T00:00:00.000Z"
            },
            {
                "url": "/cameo/root-par-6",
                "changefreq": "monthly",
                "lastmod": "2024-08-23T00:00:00.000Z"
            },
            {
                "url": "/cameo/steam-wizard-1000",
                "changefreq": "monthly",
                "lastmod": "2018-11-28T00:00:00.000Z"
            },
            {
                "url": "/cameo/steam-wizard-2000",
                "changefreq": "monthly",
                "lastmod": "2018-11-28T00:00:00.000Z"
            },
            {
                "url": "/cameo/storm",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/cameo/thunder-wash-100-rgb",
                "changefreq": "monthly",
                "lastmod": "2020-02-21T00:00:00.000Z"
            },
            {
                "url": "/cameo/thunder-wash-100-w",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/cameo/thunder-wash-600-rgb",
                "changefreq": "monthly",
                "lastmod": "2020-02-21T00:00:00.000Z"
            },
            {
                "url": "/cameo/thunder-wash-600-rgbw",
                "changefreq": "monthly",
                "lastmod": "2020-11-26T00:00:00.000Z"
            },
            {
                "url": "/cameo/thunder-wash-600-w",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/cameo/ts-60-rgbw",
                "changefreq": "monthly",
                "lastmod": "2024-09-03T00:00:00.000Z"
            },
            {
                "url": "/cameo/ts-100-ww",
                "changefreq": "monthly",
                "lastmod": "2024-10-09T00:00:00.000Z"
            },
            {
                "url": "/cameo/ts-200-fc",
                "changefreq": "monthly",
                "lastmod": "2024-11-18T00:00:00.000Z"
            },
            {
                "url": "/cameo/zenit-w600",
                "changefreq": "monthly",
                "lastmod": "2018-08-10T00:00:00.000Z"
            },
            {
                "url": "/cameo/zenit-z120",
                "changefreq": "monthly",
                "lastmod": "2024-01-08T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj",
                "changefreq": "weekly"
            },
            {
                "url": "/chauvet-dj/colorband-pix",
                "changefreq": "monthly",
                "lastmod": "2019-04-15T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/colorband-pix-ip",
                "changefreq": "monthly",
                "lastmod": "2019-04-15T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/corepar-uv-usb",
                "changefreq": "monthly",
                "lastmod": "2018-08-10T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/dmx-4",
                "changefreq": "monthly",
                "lastmod": "2022-03-15T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/eve-p-100-ww",
                "changefreq": "monthly",
                "lastmod": "2018-09-14T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/eve-p-130-rgb",
                "changefreq": "monthly",
                "lastmod": "2018-09-14T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/freedom-h1",
                "changefreq": "monthly",
                "lastmod": "2018-11-13T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/geyser-rgb",
                "changefreq": "monthly",
                "lastmod": "2019-11-01T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/gigbar-2",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/hurricane-1600",
                "changefreq": "monthly",
                "lastmod": "2024-09-25T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/hurricane-haze-1dx",
                "changefreq": "monthly",
                "lastmod": "2023-07-11T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/hurricane-haze-2d",
                "changefreq": "monthly",
                "lastmod": "2022-11-19T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/intimidator-spot-110",
                "changefreq": "monthly",
                "lastmod": "2024-01-16T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/intimidator-spot-160",
                "changefreq": "monthly",
                "lastmod": "2022-03-15T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/intimidator-spot-260",
                "changefreq": "monthly",
                "lastmod": "2019-08-22T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/kinta-x",
                "changefreq": "monthly",
                "lastmod": "2020-02-15T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/led-par-64-tri-b",
                "changefreq": "monthly",
                "lastmod": "2022-05-13T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/megastrobe-fx12",
                "changefreq": "monthly",
                "lastmod": "2022-11-28T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/motiondrape-led",
                "changefreq": "monthly",
                "lastmod": "2020-04-17T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/slimpar-pro-h-usb",
                "changefreq": "monthly",
                "lastmod": "2018-08-10T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/slimpar-pro-qz12",
                "changefreq": "monthly",
                "lastmod": "2018-08-10T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/slimpar-pro-rgba",
                "changefreq": "monthly",
                "lastmod": "2022-03-24T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/slimpar-pro-w",
                "changefreq": "monthly",
                "lastmod": "2018-08-10T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/slimpar-q12-bt",
                "changefreq": "monthly",
                "lastmod": "2018-08-10T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/slimpar-t12-bt",
                "changefreq": "monthly",
                "lastmod": "2018-08-10T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/slimpar-t12-usb",
                "changefreq": "monthly",
                "lastmod": "2022-03-22T00:00:00.000Z"
            },
            {
                "url": "/chauvet-dj/washfx",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/chauvet-professional",
                "changefreq": "weekly"
            },
            {
                "url": "/chauvet-professional/colorado-1-solo",
                "changefreq": "monthly",
                "lastmod": "2024-10-09T00:00:00.000Z"
            },
            {
                "url": "/chauvet-professional/colordash-batten-quad-6",
                "changefreq": "monthly",
                "lastmod": "2018-09-14T00:00:00.000Z"
            },
            {
                "url": "/chauvet-professional/colordash-s-par-1",
                "changefreq": "monthly",
                "lastmod": "2023-10-18T00:00:00.000Z"
            },
            {
                "url": "/chauvet-professional/ovation-f-915vw",
                "changefreq": "monthly",
                "lastmod": "2019-04-06T00:00:00.000Z"
            },
            {
                "url": "/chauvet-professional/rogue-r1-wash",
                "changefreq": "monthly",
                "lastmod": "2024-01-08T00:00:00.000Z"
            },
            {
                "url": "/chauvet-professional/rogue-r2-wash",
                "changefreq": "monthly",
                "lastmod": "2022-03-18T00:00:00.000Z"
            },
            {
                "url": "/chauvet-professional/vesuvio-rgba",
                "changefreq": "monthly",
                "lastmod": "2022-10-18T00:00:00.000Z"
            },
            {
                "url": "/chroma-q",
                "changefreq": "weekly"
            },
            {
                "url": "/chroma-q/color-force-ii-12",
                "changefreq": "monthly",
                "lastmod": "2018-08-24T00:00:00.000Z"
            },
            {
                "url": "/chroma-q/color-force-ii-48",
                "changefreq": "monthly",
                "lastmod": "2018-08-24T00:00:00.000Z"
            },
            {
                "url": "/chroma-q/color-force-ii-72",
                "changefreq": "monthly",
                "lastmod": "2018-08-24T00:00:00.000Z"
            },
            {
                "url": "/cinetec",
                "changefreq": "weekly"
            },
            {
                "url": "/cinetec/par-18x15w-rgbwa",
                "changefreq": "monthly",
                "lastmod": "2019-02-18T00:00:00.000Z"
            },
            {
                "url": "/clay-paky",
                "changefreq": "weekly"
            },
            {
                "url": "/clay-paky/a-leda-b-eye-k10",
                "changefreq": "monthly",
                "lastmod": "2019-09-10T00:00:00.000Z"
            },
            {
                "url": "/clay-paky/a-leda-b-eye-k20",
                "changefreq": "monthly",
                "lastmod": "2019-09-10T00:00:00.000Z"
            },
            {
                "url": "/clay-paky/alpha-spot-qwo-800",
                "changefreq": "monthly",
                "lastmod": "2019-05-17T00:00:00.000Z"
            },
            {
                "url": "/clay-paky/sharpy",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/clay-paky/show-batten-100",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/clay-paky/spheriscan",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/clf",
                "changefreq": "weekly"
            },
            {
                "url": "/clf/hera",
                "changefreq": "monthly",
                "lastmod": "2019-08-21T00:00:00.000Z"
            },
            {
                "url": "/coemar",
                "changefreq": "weekly"
            },
            {
                "url": "/coemar/prospot-250-lx",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/contest",
                "changefreq": "weekly"
            },
            {
                "url": "/contest/irled64-18x12six",
                "changefreq": "monthly",
                "lastmod": "2023-04-24T00:00:00.000Z"
            },
            {
                "url": "/contest/irledflat-5x12SIXb",
                "changefreq": "monthly",
                "lastmod": "2021-09-13T00:00:00.000Z"
            },
            {
                "url": "/dedolight",
                "changefreq": "weekly"
            },
            {
                "url": "/dedolight/dled4-bi",
                "changefreq": "monthly",
                "lastmod": "2018-11-11T00:00:00.000Z"
            },
            {
                "url": "/dedolight/dled7-bi",
                "changefreq": "monthly",
                "lastmod": "2018-12-19T00:00:00.000Z"
            },
            {
                "url": "/desisti",
                "changefreq": "weekly"
            },
            {
                "url": "/desisti/softled-4-vw",
                "changefreq": "monthly",
                "lastmod": "2023-10-15T00:00:00.000Z"
            },
            {
                "url": "/desisti/softled-8-vw",
                "changefreq": "monthly",
                "lastmod": "2023-10-15T00:00:00.000Z"
            },
            {
                "url": "/dmg-lumiere",
                "changefreq": "weekly"
            },
            {
                "url": "/dmg-lumiere/maxi-mix",
                "changefreq": "monthly",
                "lastmod": "2021-04-26T00:00:00.000Z"
            },
            {
                "url": "/dmg-lumiere/mini-mix",
                "changefreq": "monthly",
                "lastmod": "2021-04-26T00:00:00.000Z"
            },
            {
                "url": "/dmg-lumiere/sl1-mix",
                "changefreq": "monthly",
                "lastmod": "2021-04-26T00:00:00.000Z"
            },
            {
                "url": "/dts",
                "changefreq": "weekly"
            },
            {
                "url": "/dts/scena-led-150",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/dts/xr4-spot",
                "changefreq": "monthly",
                "lastmod": "2022-03-11T00:00:00.000Z"
            },
            {
                "url": "/dts/xr1200-wash",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/elation",
                "changefreq": "weekly"
            },
            {
                "url": "/elation/acl-360-roller",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/elation/cuepix-blinder-ww2",
                "changefreq": "monthly",
                "lastmod": "2019-10-30T00:00:00.000Z"
            },
            {
                "url": "/elation/cuepix-blinder-ww4",
                "changefreq": "monthly",
                "lastmod": "2019-10-30T00:00:00.000Z"
            },
            {
                "url": "/elation/design-led-par-zoom",
                "changefreq": "monthly",
                "lastmod": "2019-02-21T00:00:00.000Z"
            },
            {
                "url": "/elation/fuze-par-z60ip",
                "changefreq": "monthly",
                "lastmod": "2022-11-20T00:00:00.000Z"
            },
            {
                "url": "/elation/platinum-hfx",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/elation/platinum-seven",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/elation/platinum-spot-15r-pro",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/elation/proteus-hybrid",
                "changefreq": "monthly",
                "lastmod": "2026-01-30T00:00:00.000Z"
            },
            {
                "url": "/elation/sixpar-100",
                "changefreq": "monthly",
                "lastmod": "2019-01-02T00:00:00.000Z"
            },
            {
                "url": "/elation/sixpar-100-ip",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/elation/sixpar-200",
                "changefreq": "monthly",
                "lastmod": "2019-01-02T00:00:00.000Z"
            },
            {
                "url": "/elation/sixpar-200-ip",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/elation/sixpar-200-wmg",
                "changefreq": "monthly",
                "lastmod": "2019-01-02T00:00:00.000Z"
            },
            {
                "url": "/elation/sixpar-300",
                "changefreq": "monthly",
                "lastmod": "2019-01-02T00:00:00.000Z"
            },
            {
                "url": "/elation/sixpar-300-ip",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/elation/sixpar-300-wmg",
                "changefreq": "monthly",
                "lastmod": "2019-01-02T00:00:00.000Z"
            },
            {
                "url": "/elation/uni-bar",
                "changefreq": "monthly",
                "lastmod": "2019-06-17T00:00:00.000Z"
            },
            {
                "url": "/elation/zw19",
                "changefreq": "monthly",
                "lastmod": "2022-05-13T00:00:00.000Z"
            },
            {
                "url": "/eliminator",
                "changefreq": "weekly"
            },
            {
                "url": "/eliminator/stealth-beam",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/eliminator/stealth-wash-zoom",
                "changefreq": "monthly",
                "lastmod": "2021-09-13T00:00:00.000Z"
            },
            {
                "url": "/empire-lighting",
                "changefreq": "weekly"
            },
            {
                "url": "/empire-lighting/8x-3w-led-spider-effect",
                "changefreq": "monthly",
                "lastmod": "2019-10-16T00:00:00.000Z"
            },
            {
                "url": "/epsilon",
                "changefreq": "weekly"
            },
            {
                "url": "/epsilon/duo-q-beam-bar",
                "changefreq": "monthly",
                "lastmod": "2018-11-09T00:00:00.000Z"
            },
            {
                "url": "/equinox",
                "changefreq": "weekly"
            },
            {
                "url": "/equinox/gigabar",
                "changefreq": "monthly",
                "lastmod": "2018-08-24T00:00:00.000Z"
            },
            {
                "url": "/equinox/rgb-power-batten",
                "changefreq": "monthly",
                "lastmod": "2019-04-07T00:00:00.000Z"
            },
            {
                "url": "/etc",
                "changefreq": "weekly"
            },
            {
                "url": "/etc/colorsource-par",
                "changefreq": "monthly",
                "lastmod": "2019-10-30T00:00:00.000Z"
            },
            {
                "url": "/etc/colorsource-par-deep-blue",
                "changefreq": "monthly",
                "lastmod": "2019-10-30T00:00:00.000Z"
            },
            {
                "url": "/etc/colorsource-spot",
                "changefreq": "monthly",
                "lastmod": "2019-10-21T00:00:00.000Z"
            },
            {
                "url": "/etc/colorsource-spot-deep-blue",
                "changefreq": "monthly",
                "lastmod": "2019-10-21T00:00:00.000Z"
            },
            {
                "url": "/etc/fos4PD8",
                "changefreq": "monthly",
                "lastmod": "2020-10-01T00:00:00.000Z"
            },
            {
                "url": "/etc/fos4PD16",
                "changefreq": "monthly",
                "lastmod": "2020-10-01T00:00:00.000Z"
            },
            {
                "url": "/etc/fos4PD24",
                "changefreq": "monthly",
                "lastmod": "2020-10-01T00:00:00.000Z"
            },
            {
                "url": "/etc/fos4PL8",
                "changefreq": "monthly",
                "lastmod": "2020-10-01T00:00:00.000Z"
            },
            {
                "url": "/etc/fos4PL16",
                "changefreq": "monthly",
                "lastmod": "2020-10-01T00:00:00.000Z"
            },
            {
                "url": "/etc/fos4PL24",
                "changefreq": "monthly",
                "lastmod": "2020-10-01T00:00:00.000Z"
            },
            {
                "url": "/etc/source-4wrd-color-ii",
                "changefreq": "monthly",
                "lastmod": "2024-03-05T00:00:00.000Z"
            },
            {
                "url": "/etc/source-four-led-series-2-daylight-hd",
                "changefreq": "monthly",
                "lastmod": "2020-10-02T00:00:00.000Z"
            },
            {
                "url": "/etc/source-four-led-series-2-lustr",
                "changefreq": "monthly",
                "lastmod": "2020-10-02T00:00:00.000Z"
            },
            {
                "url": "/etc/source-four-led-series-2-tungsten-hd",
                "changefreq": "monthly",
                "lastmod": "2020-10-02T00:00:00.000Z"
            },
            {
                "url": "/etc/source-four-led-series-3-daylight-hdr",
                "changefreq": "monthly",
                "lastmod": "2022-05-07T00:00:00.000Z"
            },
            {
                "url": "/etc/source-four-led-series-3-lustr-x8",
                "changefreq": "monthly",
                "lastmod": "2022-05-07T00:00:00.000Z"
            },
            {
                "url": "/eurolite",
                "changefreq": "weekly"
            },
            {
                "url": "/eurolite/edx-4",
                "changefreq": "monthly",
                "lastmod": "2024-10-02T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-7c-7-silent-slim",
                "changefreq": "monthly",
                "lastmod": "2024-11-11T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-b-40",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-bar-3-hcl-bar",
                "changefreq": "monthly",
                "lastmod": "2022-05-21T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-bar-6-qcl-rgbw",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-bar-12-qcl-rgba-bar",
                "changefreq": "monthly",
                "lastmod": "2022-05-22T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-big-party-spot",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-big-party-tcl-spot",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-dmx-pixel-tube-16-rgb-ip20",
                "changefreq": "monthly",
                "lastmod": "2022-10-25T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-fe-1500",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-h2o",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-kls-801",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-ml-56-rgbw",
                "changefreq": "monthly",
                "lastmod": "2019-01-15T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-par-56-tcl",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-party-spot",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-party-tcl-spot",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-pix-12-hcl",
                "changefreq": "monthly",
                "lastmod": "2021-09-13T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-pix-144",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-ps-4-hcl",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-sls-5-bcl",
                "changefreq": "monthly",
                "lastmod": "2020-09-20T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-sls-6-uv-floor",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-sls-12-bcl",
                "changefreq": "monthly",
                "lastmod": "2020-09-20T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-svf-1",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tha-100f",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tha-100f-mk2",
                "changefreq": "monthly",
                "lastmod": "2019-04-15T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-theatre-cob-200-rgb-ww",
                "changefreq": "monthly",
                "lastmod": "2024-11-25T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tl-3-rgb-uv",
                "changefreq": "monthly",
                "lastmod": "2022-06-09T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tl-4-qcl",
                "changefreq": "monthly",
                "lastmod": "2021-10-29T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tmh-7",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tmh-8",
                "changefreq": "monthly",
                "lastmod": "2020-03-29T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tmh-9",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tmh-14",
                "changefreq": "monthly",
                "lastmod": "2022-06-10T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tmh-17",
                "changefreq": "monthly",
                "lastmod": "2019-08-22T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tmh-18",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tmh-x12",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-tmh-x25",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/led-z-200-tcl",
                "changefreq": "monthly",
                "lastmod": "2023-05-07T00:00:00.000Z"
            },
            {
                "url": "/eurolite/md-2030",
                "changefreq": "monthly",
                "lastmod": "2024-10-01T00:00:00.000Z"
            },
            {
                "url": "/eurolite/multiflood-pro-ip-smd-rgbw",
                "changefreq": "monthly",
                "lastmod": "2019-10-01T00:00:00.000Z"
            },
            {
                "url": "/eurolite/n-150",
                "changefreq": "monthly",
                "lastmod": "2020-02-19T00:00:00.000Z"
            },
            {
                "url": "/eurolite/tmh-xb-130",
                "changefreq": "monthly",
                "lastmod": "2020-01-23T00:00:00.000Z"
            },
            {
                "url": "/eurolite/ts-2",
                "changefreq": "monthly",
                "lastmod": "2023-04-20T00:00:00.000Z"
            },
            {
                "url": "/event-lighting",
                "changefreq": "weekly"
            },
            {
                "url": "/event-lighting/par5x12",
                "changefreq": "monthly",
                "lastmod": "2019-08-26T00:00:00.000Z"
            },
            {
                "url": "/event-lighting/par12x12",
                "changefreq": "monthly",
                "lastmod": "2019-08-26T00:00:00.000Z"
            },
            {
                "url": "/evolight",
                "changefreq": "weekly"
            },
            {
                "url": "/evolight/colours-archspot-54-rgb",
                "changefreq": "monthly",
                "lastmod": "2019-01-05T00:00:00.000Z"
            },
            {
                "url": "/explo",
                "changefreq": "weekly"
            },
            {
                "url": "/explo/gasprojector-gx2",
                "changefreq": "monthly",
                "lastmod": "2019-05-30T00:00:00.000Z"
            },
            {
                "url": "/explo/x2-wave-flamer",
                "changefreq": "monthly",
                "lastmod": "2019-07-20T00:00:00.000Z"
            },
            {
                "url": "/eyourlife",
                "changefreq": "weekly"
            },
            {
                "url": "/eyourlife/led-rgbw-54x3-par64",
                "changefreq": "monthly",
                "lastmod": "2019-12-26T00:00:00.000Z"
            },
            {
                "url": "/fiilex",
                "changefreq": "weekly"
            },
            {
                "url": "/fiilex/p3-color",
                "changefreq": "monthly",
                "lastmod": "2021-08-04T00:00:00.000Z"
            },
            {
                "url": "/flash-professional",
                "changefreq": "weekly"
            },
            {
                "url": "/flash-professional/led-moving-head-150w",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/flash-professional/led-par-64-cob-300w-rgbwauv",
                "changefreq": "monthly",
                "lastmod": "2019-05-30T00:00:00.000Z"
            },
            {
                "url": "/flash-professional/led-par-64-slim-7x10w-rgbw-mk2",
                "changefreq": "monthly",
                "lastmod": "2019-04-09T00:00:00.000Z"
            },
            {
                "url": "/fovitec",
                "changefreq": "weekly"
            },
            {
                "url": "/fovitec/600xb",
                "changefreq": "monthly",
                "lastmod": "2021-08-20T00:00:00.000Z"
            },
            {
                "url": "/fractal-lights",
                "changefreq": "weekly"
            },
            {
                "url": "/fractal-lights/par-led-7x9w",
                "changefreq": "monthly",
                "lastmod": "2020-02-16T00:00:00.000Z"
            },
            {
                "url": "/fractal-lights/par-led-7x10w",
                "changefreq": "monthly",
                "lastmod": "2020-02-16T00:00:00.000Z"
            },
            {
                "url": "/fractal-lights/par-led-7x12w",
                "changefreq": "monthly",
                "lastmod": "2020-02-16T00:00:00.000Z"
            },
            {
                "url": "/fun-generation",
                "changefreq": "weekly"
            },
            {
                "url": "/fun-generation/led-pot-12-1w-rgbw",
                "changefreq": "monthly",
                "lastmod": "2019-11-01T00:00:00.000Z"
            },
            {
                "url": "/fun-generation/led-pot-12x1w-qcl-rgb-ww-15",
                "changefreq": "monthly",
                "lastmod": "2024-09-30T00:00:00.000Z"
            },
            {
                "url": "/fun-generation/led-pot-12x1w-qcl-rgb-ww-40",
                "changefreq": "monthly",
                "lastmod": "2024-09-30T00:00:00.000Z"
            },
            {
                "url": "/fun-generation/picobeam-30-quad-led",
                "changefreq": "monthly",
                "lastmod": "2019-11-27T00:00:00.000Z"
            },
            {
                "url": "/fun-generation/picobeam-60-cob-rgbw",
                "changefreq": "monthly",
                "lastmod": "2019-11-27T00:00:00.000Z"
            },
            {
                "url": "/fun-generation/picoblade-fx-4x10w-rgbw",
                "changefreq": "monthly",
                "lastmod": "2019-07-18T00:00:00.000Z"
            },
            {
                "url": "/fun-generation/picospot-20-led",
                "changefreq": "monthly",
                "lastmod": "2024-05-07T00:00:00.000Z"
            },
            {
                "url": "/fun-generation/picospot-45-led",
                "changefreq": "monthly",
                "lastmod": "2023-02-05T00:00:00.000Z"
            },
            {
                "url": "/fun-generation/picowash-40-pixel-quad-led",
                "changefreq": "monthly",
                "lastmod": "2019-05-13T00:00:00.000Z"
            },
            {
                "url": "/fun-generation/separ-hex-led-rgbaw-uv",
                "changefreq": "monthly",
                "lastmod": "2022-04-11T00:00:00.000Z"
            },
            {
                "url": "/fun-generation/separ-quad-led-rgb-uv",
                "changefreq": "monthly",
                "lastmod": "2019-05-04T00:00:00.000Z"
            },
            {
                "url": "/fun-generation/separ-quad-led-rgbw",
                "changefreq": "monthly",
                "lastmod": "2019-05-04T00:00:00.000Z"
            },
            {
                "url": "/futurelight",
                "changefreq": "weekly"
            },
            {
                "url": "/futurelight/dj-scan-250",
                "changefreq": "monthly",
                "lastmod": "2021-09-14T00:00:00.000Z"
            },
            {
                "url": "/futurelight/dmh-75-i-led-moving-head",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/futurelight/pro-slim-par-7-hcl",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/futurelight/sc-250-scanner",
                "changefreq": "monthly",
                "lastmod": "2019-05-17T00:00:00.000Z"
            },
            {
                "url": "/futurelight/stb-648-led-strobe-smd-5050",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/galaxis",
                "changefreq": "weekly"
            },
            {
                "url": "/galaxis/g-flame",
                "changefreq": "monthly",
                "lastmod": "2023-10-15T00:00:00.000Z"
            },
            {
                "url": "/gantom",
                "changefreq": "weekly"
            },
            {
                "url": "/gantom/precision-dmx",
                "changefreq": "monthly",
                "lastmod": "2020-03-28T00:00:00.000Z"
            },
            {
                "url": "/generic",
                "changefreq": "weekly"
            },
            {
                "url": "/generic/4-channel-dimmer-pack",
                "changefreq": "monthly",
                "lastmod": "2021-06-17T00:00:00.000Z"
            },
            {
                "url": "/generic/cmy-fader",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/generic/color-temperature-fader",
                "changefreq": "monthly",
                "lastmod": "2024-05-13T00:00:00.000Z"
            },
            {
                "url": "/generic/cw-ww-fader",
                "changefreq": "monthly",
                "lastmod": "2019-06-23T00:00:00.000Z"
            },
            {
                "url": "/generic/desk-channel",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/generic/drgb-fader",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/generic/drgbw-fader",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/generic/grbw-fader",
                "changefreq": "monthly",
                "lastmod": "2020-04-17T00:00:00.000Z"
            },
            {
                "url": "/generic/pan-tilt",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/generic/rgb-fader",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/generic/rgba-fader",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/generic/rgbd-fader",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/generic/rgbw-fader",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/generic/rgbwauv-fader",
                "changefreq": "monthly",
                "lastmod": "2023-04-20T00:00:00.000Z"
            },
            {
                "url": "/generic/rgbww-fader",
                "changefreq": "monthly",
                "lastmod": "2019-01-21T00:00:00.000Z"
            },
            {
                "url": "/generic/strobe",
                "changefreq": "monthly",
                "lastmod": "2019-11-01T00:00:00.000Z"
            },
            {
                "url": "/ghost",
                "changefreq": "weekly"
            },
            {
                "url": "/ghost/ip-spot-bat",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/ghost/ip-spot-pro",
                "changefreq": "monthly",
                "lastmod": "2019-08-08T00:00:00.000Z"
            },
            {
                "url": "/glp",
                "changefreq": "weekly"
            },
            {
                "url": "/glp/force-120",
                "changefreq": "monthly",
                "lastmod": "2018-12-04T00:00:00.000Z"
            },
            {
                "url": "/glp/impression-fr1",
                "changefreq": "monthly",
                "lastmod": "2019-05-17T00:00:00.000Z"
            },
            {
                "url": "/glp/impression-laser",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/glp/impression-spot-one",
                "changefreq": "monthly",
                "lastmod": "2019-05-17T00:00:00.000Z"
            },
            {
                "url": "/glp/impression-x4-bar-10",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/glp/jdc1",
                "changefreq": "monthly",
                "lastmod": "2019-12-03T00:00:00.000Z"
            },
            {
                "url": "/glp/knv-arc",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/glp/knv-cube",
                "changefreq": "monthly",
                "lastmod": "2019-04-05T00:00:00.000Z"
            },
            {
                "url": "/glx",
                "changefreq": "weekly"
            },
            {
                "url": "/glx/gls-4-led-stage-4",
                "changefreq": "monthly",
                "lastmod": "2019-07-11T00:00:00.000Z"
            },
            {
                "url": "/griven",
                "changefreq": "weekly"
            },
            {
                "url": "/griven/kolorado-4000",
                "changefreq": "monthly",
                "lastmod": "2019-07-22T00:00:00.000Z"
            },
            {
                "url": "/gruft",
                "changefreq": "weekly"
            },
            {
                "url": "/gruft/pixel-tube",
                "changefreq": "monthly",
                "lastmod": "2018-11-19T00:00:00.000Z"
            },
            {
                "url": "/gruft/ventilator",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/hazebase",
                "changefreq": "weekly"
            },
            {
                "url": "/hazebase/base-hazer-pro",
                "changefreq": "monthly",
                "lastmod": "2019-11-05T00:00:00.000Z"
            },
            {
                "url": "/hive",
                "changefreq": "weekly"
            },
            {
                "url": "/hive/bee-50-c",
                "changefreq": "monthly",
                "lastmod": "2021-02-20T00:00:00.000Z"
            },
            {
                "url": "/hive/bumble-bee-25-cx",
                "changefreq": "monthly",
                "lastmod": "2021-02-20T00:00:00.000Z"
            },
            {
                "url": "/hive/hornet-200-c",
                "changefreq": "monthly",
                "lastmod": "2021-02-20T00:00:00.000Z"
            },
            {
                "url": "/hive/hornet-200-cx",
                "changefreq": "monthly",
                "lastmod": "2021-02-20T00:00:00.000Z"
            },
            {
                "url": "/hive/super-hornet-575-c",
                "changefreq": "monthly",
                "lastmod": "2021-02-20T00:00:00.000Z"
            },
            {
                "url": "/hive/wasp-100-c",
                "changefreq": "monthly",
                "lastmod": "2021-02-20T00:00:00.000Z"
            },
            {
                "url": "/hive/wasp-100-cx",
                "changefreq": "monthly",
                "lastmod": "2021-02-20T00:00:00.000Z"
            },
            {
                "url": "/hong-yi",
                "changefreq": "weekly"
            },
            {
                "url": "/hong-yi/hy-g60",
                "changefreq": "monthly",
                "lastmod": "2018-12-12T00:00:00.000Z"
            },
            {
                "url": "/hsl",
                "changefreq": "weekly"
            },
            {
                "url": "/hsl/40w-beam-spot-light-rgbw",
                "changefreq": "monthly",
                "lastmod": "2023-06-24T00:00:00.000Z"
            },
            {
                "url": "/ibiza-light",
                "changefreq": "weekly"
            },
            {
                "url": "/ibiza-light/lp64-led-promo",
                "changefreq": "monthly",
                "lastmod": "2019-12-13T00:00:00.000Z"
            },
            {
                "url": "/ibiza-light/ls-005led",
                "changefreq": "monthly",
                "lastmod": "2019-07-29T00:00:00.000Z"
            },
            {
                "url": "/ibiza-light/par-mini-rgb3",
                "changefreq": "monthly",
                "lastmod": "2018-10-06T00:00:00.000Z"
            },
            {
                "url": "/ignition",
                "changefreq": "weekly"
            },
            {
                "url": "/ignition/2bright-par-18-ip",
                "changefreq": "monthly",
                "lastmod": "2022-06-17T00:00:00.000Z"
            },
            {
                "url": "/ignition/led-accu-par",
                "changefreq": "monthly",
                "lastmod": "2019-05-15T00:00:00.000Z"
            },
            {
                "url": "/ignition/strip-blinder-x",
                "changefreq": "monthly",
                "lastmod": "2026-01-28T00:00:00.000Z"
            },
            {
                "url": "/ignition/teatro-led-spot-100-fr",
                "changefreq": "monthly",
                "lastmod": "2022-06-09T00:00:00.000Z"
            },
            {
                "url": "/ignition/teatro-led-spot-100-pc",
                "changefreq": "monthly",
                "lastmod": "2022-06-09T00:00:00.000Z"
            },
            {
                "url": "/ikan",
                "changefreq": "weekly"
            },
            {
                "url": "/ikan/stryder-sfb150",
                "changefreq": "monthly",
                "lastmod": "2024-05-07T00:00:00.000Z"
            },
            {
                "url": "/infinity",
                "changefreq": "weekly"
            },
            {
                "url": "/infinity/iw-340-rdm",
                "changefreq": "monthly",
                "lastmod": "2018-11-23T00:00:00.000Z"
            },
            {
                "url": "/infinity/iw-720-rdm",
                "changefreq": "monthly",
                "lastmod": "2020-02-15T00:00:00.000Z"
            },
            {
                "url": "/jb-lighting",
                "changefreq": "weekly"
            },
            {
                "url": "/jb-lighting/jbled-a7",
                "changefreq": "monthly",
                "lastmod": "2019-11-29T00:00:00.000Z"
            },
            {
                "url": "/jb-lighting/varyscan-p7",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/jb-systems",
                "changefreq": "weekly"
            },
            {
                "url": "/jb-systems/imove-5s",
                "changefreq": "monthly",
                "lastmod": "2020-09-20T00:00:00.000Z"
            },
            {
                "url": "/jb-systems/irock-5c",
                "changefreq": "monthly",
                "lastmod": "2021-02-18T00:00:00.000Z"
            },
            {
                "url": "/jb-systems/twin-effect-laser",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/kam",
                "changefreq": "weekly"
            },
            {
                "url": "/kam/gobotracer",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/kino-flo",
                "changefreq": "weekly"
            },
            {
                "url": "/kino-flo/celeb-250-led-dmx",
                "changefreq": "monthly",
                "lastmod": "2022-05-07T00:00:00.000Z"
            },
            {
                "url": "/kino-flo/celeb-450-led-dmx",
                "changefreq": "monthly",
                "lastmod": "2022-05-07T00:00:00.000Z"
            },
            {
                "url": "/kino-flo/celeb-led-201-dmx",
                "changefreq": "monthly",
                "lastmod": "2022-05-07T00:00:00.000Z"
            },
            {
                "url": "/lalucenatz",
                "changefreq": "weekly"
            },
            {
                "url": "/lalucenatz/18leds-par-light",
                "changefreq": "monthly",
                "lastmod": "2019-09-21T00:00:00.000Z"
            },
            {
                "url": "/lalucenatz/dj-lights",
                "changefreq": "monthly",
                "lastmod": "2020-04-17T00:00:00.000Z"
            },
            {
                "url": "/laserworld",
                "changefreq": "weekly"
            },
            {
                "url": "/laserworld/cs-1000rgb",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/laserworld/ds-1000rgb",
                "changefreq": "monthly",
                "lastmod": "2019-01-08T00:00:00.000Z"
            },
            {
                "url": "/laserworld/el-400rgb-mk2",
                "changefreq": "monthly",
                "lastmod": "2025-10-23T00:00:00.000Z"
            },
            {
                "url": "/laserworld/shownet",
                "changefreq": "monthly",
                "lastmod": "2020-02-16T00:00:00.000Z"
            },
            {
                "url": "/ledj",
                "changefreq": "weekly"
            },
            {
                "url": "/ledj/slimline-12q5-rgba",
                "changefreq": "monthly",
                "lastmod": "2019-03-14T00:00:00.000Z"
            },
            {
                "url": "/ledj/slimline-12q5-rgbw",
                "changefreq": "monthly",
                "lastmod": "2019-03-14T00:00:00.000Z"
            },
            {
                "url": "/lep-laser",
                "changefreq": "weekly"
            },
            {
                "url": "/lep-laser/diamond-pro-2-8",
                "changefreq": "monthly",
                "lastmod": "2019-10-15T00:00:00.000Z"
            },
            {
                "url": "/light-sky",
                "changefreq": "weekly"
            },
            {
                "url": "/light-sky/aurora",
                "changefreq": "monthly",
                "lastmod": "2019-09-21T00:00:00.000Z"
            },
            {
                "url": "/light4me",
                "changefreq": "weekly"
            },
            {
                "url": "/light4me/led-par-18x3w-uv",
                "changefreq": "monthly",
                "lastmod": "2024-11-16T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx",
                "changefreq": "weekly"
            },
            {
                "url": "/lightmaxx/cls-nano-cob",
                "changefreq": "monthly",
                "lastmod": "2023-10-15T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx/dj-scan-led",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx/easy-wash-quad-led",
                "changefreq": "monthly",
                "lastmod": "2018-11-02T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx/led-blinder-4",
                "changefreq": "monthly",
                "lastmod": "2026-02-02T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx/led-nano-par",
                "changefreq": "monthly",
                "lastmod": "2021-10-30T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx/led-par-56",
                "changefreq": "monthly",
                "lastmod": "2021-08-05T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx/led-par-64-cob-100w-rgb",
                "changefreq": "monthly",
                "lastmod": "2026-01-28T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx/platinum-mini-tri-par",
                "changefreq": "monthly",
                "lastmod": "2018-09-22T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx/vector-haze-1-0",
                "changefreq": "monthly",
                "lastmod": "2022-11-17T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx/vector-pixel-bar-18x-15w-rgbwa",
                "changefreq": "monthly",
                "lastmod": "2020-03-29T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx/vega-bat-1",
                "changefreq": "monthly",
                "lastmod": "2023-07-07T00:00:00.000Z"
            },
            {
                "url": "/lightmaxx/vega-zoom-wash",
                "changefreq": "monthly",
                "lastmod": "2018-09-22T00:00:00.000Z"
            },
            {
                "url": "/lite-tek",
                "changefreq": "weekly"
            },
            {
                "url": "/lite-tek/beam-230",
                "changefreq": "monthly",
                "lastmod": "2019-10-02T00:00:00.000Z"
            },
            {
                "url": "/litecraft",
                "changefreq": "weekly"
            },
            {
                "url": "/litecraft/washx-21",
                "changefreq": "monthly",
                "lastmod": "2021-08-20T00:00:00.000Z"
            },
            {
                "url": "/litecraft/washx-432-sw",
                "changefreq": "monthly",
                "lastmod": "2026-02-03T00:00:00.000Z"
            },
            {
                "url": "/litegear",
                "changefreq": "weekly"
            },
            {
                "url": "/litegear/litemat-plus-1",
                "changefreq": "monthly",
                "lastmod": "2021-01-17T00:00:00.000Z"
            },
            {
                "url": "/litegear/litemat-plus-2",
                "changefreq": "monthly",
                "lastmod": "2021-01-17T00:00:00.000Z"
            },
            {
                "url": "/litegear/litemat-plus-2l",
                "changefreq": "monthly",
                "lastmod": "2021-01-17T00:00:00.000Z"
            },
            {
                "url": "/litegear/litemat-plus-3",
                "changefreq": "monthly",
                "lastmod": "2021-01-17T00:00:00.000Z"
            },
            {
                "url": "/litegear/litemat-plus-4",
                "changefreq": "monthly",
                "lastmod": "2021-01-17T00:00:00.000Z"
            },
            {
                "url": "/litegear/litemat-plus-8",
                "changefreq": "monthly",
                "lastmod": "2021-01-17T00:00:00.000Z"
            },
            {
                "url": "/litegear/litetile-plus-4",
                "changefreq": "monthly",
                "lastmod": "2021-01-17T00:00:00.000Z"
            },
            {
                "url": "/litegear/litetile-plus-8",
                "changefreq": "monthly",
                "lastmod": "2021-01-17T00:00:00.000Z"
            },
            {
                "url": "/litegear/s2-litemat-1",
                "changefreq": "monthly",
                "lastmod": "2021-01-16T00:00:00.000Z"
            },
            {
                "url": "/litegear/s2-litemat-2",
                "changefreq": "monthly",
                "lastmod": "2021-01-16T00:00:00.000Z"
            },
            {
                "url": "/litegear/s2-litemat-2l",
                "changefreq": "monthly",
                "lastmod": "2021-01-16T00:00:00.000Z"
            },
            {
                "url": "/litegear/s2-litemat-3",
                "changefreq": "monthly",
                "lastmod": "2021-01-17T00:00:00.000Z"
            },
            {
                "url": "/litegear/s2-litemat-4",
                "changefreq": "monthly",
                "lastmod": "2021-01-17T00:00:00.000Z"
            },
            {
                "url": "/lixada",
                "changefreq": "weekly"
            },
            {
                "url": "/lixada/mini-beam-rgbw",
                "changefreq": "monthly",
                "lastmod": "2019-12-23T00:00:00.000Z"
            },
            {
                "url": "/lixada/mini-gobo-moving-head-light",
                "changefreq": "monthly",
                "lastmod": "2024-05-07T00:00:00.000Z"
            },
            {
                "url": "/lixada/mini-moving-head-rgbw",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/look",
                "changefreq": "weekly"
            },
            {
                "url": "/look/cryofog",
                "changefreq": "monthly",
                "lastmod": "2021-08-05T00:00:00.000Z"
            },
            {
                "url": "/look/viper-nt",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/lupo",
                "changefreq": "weekly"
            },
            {
                "url": "/lupo/actionpanel-dual-color",
                "changefreq": "monthly",
                "lastmod": "2023-10-24T00:00:00.000Z"
            },
            {
                "url": "/lupo/actionpanel-full-color",
                "changefreq": "monthly",
                "lastmod": "2023-10-24T00:00:00.000Z"
            },
            {
                "url": "/lupo/superpanel-dual-color-60",
                "changefreq": "monthly",
                "lastmod": "2023-10-24T00:00:00.000Z"
            },
            {
                "url": "/lupo/superpanel-full-color-60",
                "changefreq": "monthly",
                "lastmod": "2023-10-24T00:00:00.000Z"
            },
            {
                "url": "/lupo/superpanelpro-dual-color-30",
                "changefreq": "monthly",
                "lastmod": "2023-10-24T00:00:00.000Z"
            },
            {
                "url": "/lupo/superpanelpro-full-color-30",
                "changefreq": "monthly",
                "lastmod": "2023-10-24T00:00:00.000Z"
            },
            {
                "url": "/lupo/ultrapanel-dual-color-60",
                "changefreq": "monthly",
                "lastmod": "2023-10-24T00:00:00.000Z"
            },
            {
                "url": "/lupo/ultrapanel-full-color-60",
                "changefreq": "monthly",
                "lastmod": "2023-10-24T00:00:00.000Z"
            },
            {
                "url": "/lupo/ultrapanelpro-dual-color-30",
                "changefreq": "monthly",
                "lastmod": "2023-10-24T00:00:00.000Z"
            },
            {
                "url": "/lupo/ultrapanelpro-full-color-30",
                "changefreq": "monthly",
                "lastmod": "2023-10-24T00:00:00.000Z"
            },
            {
                "url": "/magicfx",
                "changefreq": "weekly"
            },
            {
                "url": "/magicfx/psyco2jet",
                "changefreq": "monthly",
                "lastmod": "2018-08-21T00:00:00.000Z"
            },
            {
                "url": "/magicfx/smokejet",
                "changefreq": "monthly",
                "lastmod": "2018-09-06T00:00:00.000Z"
            },
            {
                "url": "/magicfx/stage-flame",
                "changefreq": "monthly",
                "lastmod": "2018-08-21T00:00:00.000Z"
            },
            {
                "url": "/mark",
                "changefreq": "weekly"
            },
            {
                "url": "/mark/mbar-381-ip",
                "changefreq": "monthly",
                "lastmod": "2019-03-04T00:00:00.000Z"
            },
            {
                "url": "/mark/superbat-led-72",
                "changefreq": "monthly",
                "lastmod": "2019-03-04T00:00:00.000Z"
            },
            {
                "url": "/martin",
                "changefreq": "weekly"
            },
            {
                "url": "/martin/atomic-3000",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/martin/mac-250-beam",
                "changefreq": "monthly",
                "lastmod": "2019-10-31T00:00:00.000Z"
            },
            {
                "url": "/martin/mac-250-krypton",
                "changefreq": "monthly",
                "lastmod": "2019-10-08T00:00:00.000Z"
            },
            {
                "url": "/martin/mac-250-wash",
                "changefreq": "monthly",
                "lastmod": "2019-10-31T00:00:00.000Z"
            },
            {
                "url": "/martin/mac-600",
                "changefreq": "monthly",
                "lastmod": "2019-03-12T00:00:00.000Z"
            },
            {
                "url": "/martin/mac-700-wash",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/martin/mac-aura",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/martin/mac-axiom-hybrid",
                "changefreq": "monthly",
                "lastmod": "2026-02-26T00:00:00.000Z"
            },
            {
                "url": "/martin/mac-encore-performance",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/martin/mac-viper-airfx",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/martin/mac-viper-performance",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/martin/mac-viper-wash",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/martin/magnum-2500-hz",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/martin/mania-scx500",
                "changefreq": "monthly",
                "lastmod": "2023-10-17T00:00:00.000Z"
            },
            {
                "url": "/martin/mx-10-extreme",
                "changefreq": "monthly",
                "lastmod": "2024-01-22T00:00:00.000Z"
            },
            {
                "url": "/martin/roboscan-812",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/martin/rush-mh-2-wash",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/martin/rush-mh-3-beam",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/martin/rush-mh-5-profile",
                "changefreq": "monthly",
                "lastmod": "2021-02-18T00:00:00.000Z"
            },
            {
                "url": "/martin/rush-mh-7-hybrid",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/martin/rush-par-2-rgbw-zoom",
                "changefreq": "monthly",
                "lastmod": "2018-11-11T00:00:00.000Z"
            },
            {
                "url": "/martin/rush-scanner-1-led",
                "changefreq": "monthly",
                "lastmod": "2019-03-07T00:00:00.000Z"
            },
            {
                "url": "/martin/stagebar-54l",
                "changefreq": "monthly",
                "lastmod": "2019-10-06T00:00:00.000Z"
            },
            {
                "url": "/martin/stagebar-54s",
                "changefreq": "monthly",
                "lastmod": "2019-10-06T00:00:00.000Z"
            },
            {
                "url": "/mdg",
                "changefreq": "weekly"
            },
            {
                "url": "/mdg/atme",
                "changefreq": "monthly",
                "lastmod": "2026-01-23T00:00:00.000Z"
            },
            {
                "url": "/mdg/hazer-atmosphere-aps",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/mdg/theone-atmospheric-generator",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/mega-led-lighting",
                "changefreq": "weekly"
            },
            {
                "url": "/mega-led-lighting/led-par-light-372",
                "changefreq": "monthly",
                "lastmod": "2019-02-06T00:00:00.000Z"
            },
            {
                "url": "/mega-led-lighting/zoom-360",
                "changefreq": "monthly",
                "lastmod": "2019-02-06T00:00:00.000Z"
            },
            {
                "url": "/mega-lite",
                "changefreq": "weekly"
            },
            {
                "url": "/mega-lite/framebot-600",
                "changefreq": "monthly",
                "lastmod": "2024-10-15T00:00:00.000Z"
            },
            {
                "url": "/mega-lite/mw1",
                "changefreq": "monthly",
                "lastmod": "2024-10-08T00:00:00.000Z"
            },
            {
                "url": "/mega-lite/spotbot-led-cmy-300",
                "changefreq": "monthly",
                "lastmod": "2023-10-22T00:00:00.000Z"
            },
            {
                "url": "/mega-lite/washbot-led-cymk-300",
                "changefreq": "monthly",
                "lastmod": "2023-10-22T00:00:00.000Z"
            },
            {
                "url": "/minuit-une",
                "changefreq": "weekly"
            },
            {
                "url": "/minuit-une/ivl-carre",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/nicols",
                "changefreq": "weekly"
            },
            {
                "url": "/nicols/led-bar-123-fc-ip",
                "changefreq": "monthly",
                "lastmod": "2018-08-24T00:00:00.000Z"
            },
            {
                "url": "/nicols/pat-252",
                "changefreq": "monthly",
                "lastmod": "2018-11-23T00:00:00.000Z"
            },
            {
                "url": "/orion",
                "changefreq": "weekly"
            },
            {
                "url": "/orion/orcan2",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/panasonic",
                "changefreq": "weekly"
            },
            {
                "url": "/panasonic/pt-rz120",
                "changefreq": "monthly",
                "lastmod": "2020-04-03T00:00:00.000Z"
            },
            {
                "url": "/panasonic/pt-rz120l",
                "changefreq": "monthly",
                "lastmod": "2020-03-30T00:00:00.000Z"
            },
            {
                "url": "/phocea-light",
                "changefreq": "weekly"
            },
            {
                "url": "/phocea-light/box-leds-batterie-6x15w",
                "changefreq": "monthly",
                "lastmod": "2020-03-24T00:00:00.000Z"
            },
            {
                "url": "/powerlighting",
                "changefreq": "weekly"
            },
            {
                "url": "/powerlighting/wash-84w",
                "changefreq": "monthly",
                "lastmod": "2019-05-17T00:00:00.000Z"
            },
            {
                "url": "/pr-lighting",
                "changefreq": "weekly"
            },
            {
                "url": "/pr-lighting/xs-250-spot",
                "changefreq": "monthly",
                "lastmod": "2019-03-29T00:00:00.000Z"
            },
            {
                "url": "/prolights",
                "changefreq": "weekly"
            },
            {
                "url": "/prolights/diamond19",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/prolights/pixpan16",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/prolights/polar3000",
                "changefreq": "monthly",
                "lastmod": "2019-02-16T00:00:00.000Z"
            },
            {
                "url": "/prolights/smartbat",
                "changefreq": "monthly",
                "lastmod": "2019-12-23T00:00:00.000Z"
            },
            {
                "url": "/prolights/v700spot",
                "changefreq": "monthly",
                "lastmod": "2018-11-01T00:00:00.000Z"
            },
            {
                "url": "/qtx",
                "changefreq": "weekly"
            },
            {
                "url": "/qtx/lux-ld01",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/qtx/lux-ld30w",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/renkforce",
                "changefreq": "weekly"
            },
            {
                "url": "/renkforce/gm107",
                "changefreq": "monthly",
                "lastmod": "2018-09-13T00:00:00.000Z"
            },
            {
                "url": "/robe",
                "changefreq": "weekly"
            },
            {
                "url": "/robe/colorspot-2500e-at",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/robe/dj-scan-250-xt",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/robe/robin-300e-wash",
                "changefreq": "monthly",
                "lastmod": "2019-03-02T00:00:00.000Z"
            },
            {
                "url": "/robe/robin-600e-spot",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/robe/robin-ledbeam-100",
                "changefreq": "monthly",
                "lastmod": "2019-01-21T00:00:00.000Z"
            },
            {
                "url": "/robe/robin-ledbeam-150",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/robe/robin-ledwash-600",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/robe/robin-parfect-150",
                "changefreq": "monthly",
                "lastmod": "2019-01-05T00:00:00.000Z"
            },
            {
                "url": "/robe/robin-t1-profile",
                "changefreq": "monthly",
                "lastmod": "2022-09-24T00:00:00.000Z"
            },
            {
                "url": "/robe/robin-viva-cmy",
                "changefreq": "monthly",
                "lastmod": "2021-09-13T00:00:00.000Z"
            },
            {
                "url": "/robe/spot-160-xt",
                "changefreq": "monthly",
                "lastmod": "2026-01-30T00:00:00.000Z"
            },
            {
                "url": "/robert-juliat",
                "changefreq": "weekly"
            },
            {
                "url": "/robert-juliat/613sx",
                "changefreq": "monthly",
                "lastmod": "2018-11-27T00:00:00.000Z"
            },
            {
                "url": "/rockville",
                "changefreq": "weekly"
            },
            {
                "url": "/rockville/rockpar50",
                "changefreq": "monthly",
                "lastmod": "2019-05-03T00:00:00.000Z"
            },
            {
                "url": "/sgm",
                "changefreq": "weekly"
            },
            {
                "url": "/sgm/p-5",
                "changefreq": "monthly",
                "lastmod": "2020-03-28T00:00:00.000Z"
            },
            {
                "url": "/shehds",
                "changefreq": "weekly"
            },
            {
                "url": "/shehds/led-flat-par-7x18w-rgbwa-uv-light",
                "changefreq": "monthly",
                "lastmod": "2023-02-05T00:00:00.000Z"
            },
            {
                "url": "/shehds/led-flat-par-12x3w-rgbw",
                "changefreq": "monthly",
                "lastmod": "2023-02-12T00:00:00.000Z"
            },
            {
                "url": "/shehds/led-flat-par-18x18w",
                "changefreq": "monthly",
                "lastmod": "2026-01-30T00:00:00.000Z"
            },
            {
                "url": "/shehds/led-flat-par-54x3w",
                "changefreq": "monthly",
                "lastmod": "2022-10-21T00:00:00.000Z"
            },
            {
                "url": "/shehds/led-par-18x18w",
                "changefreq": "monthly",
                "lastmod": "2022-11-06T00:00:00.000Z"
            },
            {
                "url": "/shehds/led-spot-60w",
                "changefreq": "monthly",
                "lastmod": "2023-04-20T00:00:00.000Z"
            },
            {
                "url": "/showline",
                "changefreq": "weekly"
            },
            {
                "url": "/showline/sl-nitro-510c",
                "changefreq": "monthly",
                "lastmod": "2019-10-02T00:00:00.000Z"
            },
            {
                "url": "/showlite",
                "changefreq": "weekly"
            },
            {
                "url": "/showlite/lb-4390",
                "changefreq": "monthly",
                "lastmod": "2020-07-20T00:00:00.000Z"
            },
            {
                "url": "/showpro",
                "changefreq": "weekly"
            },
            {
                "url": "/showpro/litebar-h9",
                "changefreq": "monthly",
                "lastmod": "2019-12-10T00:00:00.000Z"
            },
            {
                "url": "/showtec",
                "changefreq": "weekly"
            },
            {
                "url": "/showtec/accent-spot-q4-rgbw",
                "changefreq": "monthly",
                "lastmod": "2023-10-22T00:00:00.000Z"
            },
            {
                "url": "/showtec/archi-painter-24-8-q4",
                "changefreq": "monthly",
                "lastmod": "2019-05-17T00:00:00.000Z"
            },
            {
                "url": "/showtec/atmos-2000",
                "changefreq": "monthly",
                "lastmod": "2018-11-27T00:00:00.000Z"
            },
            {
                "url": "/showtec/club-par-12-4-rgbw",
                "changefreq": "monthly",
                "lastmod": "2018-11-02T00:00:00.000Z"
            },
            {
                "url": "/showtec/club-par-12-6-rgbwauv",
                "changefreq": "monthly",
                "lastmod": "2022-11-07T00:00:00.000Z"
            },
            {
                "url": "/showtec/compact-par-7-tri",
                "changefreq": "monthly",
                "lastmod": "2020-02-19T00:00:00.000Z"
            },
            {
                "url": "/showtec/compact-par-18",
                "changefreq": "monthly",
                "lastmod": "2019-08-26T00:00:00.000Z"
            },
            {
                "url": "/showtec/dim-4lc",
                "changefreq": "monthly",
                "lastmod": "2024-10-02T00:00:00.000Z"
            },
            {
                "url": "/showtec/dominator",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/showtec/explorer-250-wash-pro",
                "changefreq": "monthly",
                "lastmod": "2023-10-15T00:00:00.000Z"
            },
            {
                "url": "/showtec/horizon-8",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/showtec/kanjo-spot-60",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/showtec/kanjo-wash-rgb",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/showtec/led-blinder-2-cob",
                "changefreq": "monthly",
                "lastmod": "2023-05-07T00:00:00.000Z"
            },
            {
                "url": "/showtec/led-light-bar-rgb-v3",
                "changefreq": "monthly",
                "lastmod": "2018-08-24T00:00:00.000Z"
            },
            {
                "url": "/showtec/performer-2500",
                "changefreq": "monthly",
                "lastmod": "2022-10-19T00:00:00.000Z"
            },
            {
                "url": "/showtec/phantom-3r-beam",
                "changefreq": "monthly",
                "lastmod": "2019-07-26T00:00:00.000Z"
            },
            {
                "url": "/showtec/phantom-25-led-wash",
                "changefreq": "monthly",
                "lastmod": "2021-09-14T00:00:00.000Z"
            },
            {
                "url": "/showtec/phantom-50-led-spot",
                "changefreq": "monthly",
                "lastmod": "2020-02-11T00:00:00.000Z"
            },
            {
                "url": "/showtec/phantom-140-led-spot",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/showtec/phantom-matrix-fx",
                "changefreq": "monthly",
                "lastmod": "2020-02-11T00:00:00.000Z"
            },
            {
                "url": "/showtec/pixel-bar-12-mkii",
                "changefreq": "monthly",
                "lastmod": "2018-08-24T00:00:00.000Z"
            },
            {
                "url": "/showtec/shark-the-meg-hybrid-one",
                "changefreq": "monthly",
                "lastmod": "2026-01-27T00:00:00.000Z"
            },
            {
                "url": "/showtec/sunraise-led",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/showtec/sunstrip-active-mkii",
                "changefreq": "monthly",
                "lastmod": "2018-11-02T00:00:00.000Z"
            },
            {
                "url": "/showtec/xs-1-rgbw",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/showven",
                "changefreq": "weekly"
            },
            {
                "url": "/showven/sparkular",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/showven/sparkular-fall",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/silver-star",
                "changefreq": "weekly"
            },
            {
                "url": "/silver-star/mx-indigo-6000xe",
                "changefreq": "monthly",
                "lastmod": "2019-10-26T00:00:00.000Z"
            },
            {
                "url": "/skypix",
                "changefreq": "weekly"
            },
            {
                "url": "/skypix/ribalta-beam",
                "changefreq": "monthly",
                "lastmod": "2018-10-16T00:00:00.000Z"
            },
            {
                "url": "/smoke-factory",
                "changefreq": "weekly"
            },
            {
                "url": "/smoke-factory/data-ii",
                "changefreq": "monthly",
                "lastmod": "2023-07-10T00:00:00.000Z"
            },
            {
                "url": "/smoke-factory/tour-hazer-ii",
                "changefreq": "monthly",
                "lastmod": "2023-07-10T00:00:00.000Z"
            },
            {
                "url": "/solaris",
                "changefreq": "weekly"
            },
            {
                "url": "/solaris/smart-36",
                "changefreq": "monthly",
                "lastmod": "2018-10-25T00:00:00.000Z"
            },
            {
                "url": "/solena",
                "changefreq": "weekly"
            },
            {
                "url": "/solena/max-par-20",
                "changefreq": "monthly",
                "lastmod": "2018-11-02T00:00:00.000Z"
            },
            {
                "url": "/solena/mini-par-12",
                "changefreq": "monthly",
                "lastmod": "2018-10-12T00:00:00.000Z"
            },
            {
                "url": "/soundlight",
                "changefreq": "weekly"
            },
            {
                "url": "/soundlight/3204r-h",
                "changefreq": "monthly",
                "lastmod": "2019-06-03T00:00:00.000Z"
            },
            {
                "url": "/stage-right",
                "changefreq": "weekly"
            },
            {
                "url": "/stage-right/mini-beam-rgbw",
                "changefreq": "monthly",
                "lastmod": "2019-12-23T00:00:00.000Z"
            },
            {
                "url": "/stage-right/stage-wash-7x10w-led-moving-head",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/stairville",
                "changefreq": "weekly"
            },
            {
                "url": "/stairville/af-180-led-fogger",
                "changefreq": "monthly",
                "lastmod": "2019-10-06T00:00:00.000Z"
            },
            {
                "url": "/stairville/af-250",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/stairville/afh-600",
                "changefreq": "monthly",
                "lastmod": "2019-08-26T00:00:00.000Z"
            },
            {
                "url": "/stairville/bel6-ip-bar-hex",
                "changefreq": "monthly",
                "lastmod": "2021-12-03T00:00:00.000Z"
            },
            {
                "url": "/stairville/clb5-2p-rgb-ww-compact-led-par",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/stairville/cx60-hex",
                "changefreq": "monthly",
                "lastmod": "2026-02-26T00:00:00.000Z"
            },
            {
                "url": "/stairville/hz-200-compact-hazer",
                "changefreq": "monthly",
                "lastmod": "2024-10-01T00:00:00.000Z"
            },
            {
                "url": "/stairville/led-bar-240-8",
                "changefreq": "monthly",
                "lastmod": "2022-06-10T00:00:00.000Z"
            },
            {
                "url": "/stairville/led-flood-panel-150",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/stairville/led-par-56",
                "changefreq": "monthly",
                "lastmod": "2021-03-19T00:00:00.000Z"
            },
            {
                "url": "/stairville/led-par-64",
                "changefreq": "monthly",
                "lastmod": "2021-10-04T00:00:00.000Z"
            },
            {
                "url": "/stairville/matrixx-sc-100",
                "changefreq": "monthly",
                "lastmod": "2022-03-07T00:00:00.000Z"
            },
            {
                "url": "/stairville/mh-100",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/stairville/mh-x20",
                "changefreq": "monthly",
                "lastmod": "2024-10-01T00:00:00.000Z"
            },
            {
                "url": "/stairville/mh-x25",
                "changefreq": "monthly",
                "lastmod": "2018-09-04T00:00:00.000Z"
            },
            {
                "url": "/stairville/mh-x30-led-spot",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/stairville/mh-x50",
                "changefreq": "monthly",
                "lastmod": "2020-07-20T00:00:00.000Z"
            },
            {
                "url": "/stairville/mh-x60",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/stairville/octagon-theater-20x6w-cw-ww-a",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/stairville/par-56",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/stairville/remus-hexspot-515",
                "changefreq": "monthly",
                "lastmod": "2024-03-05T00:00:00.000Z"
            },
            {
                "url": "/stairville/revueled-120-cob-rgbww",
                "changefreq": "monthly",
                "lastmod": "2025-08-29T00:00:00.000Z"
            },
            {
                "url": "/stairville/revueled-120-cob-true-white",
                "changefreq": "monthly",
                "lastmod": "2024-01-29T00:00:00.000Z"
            },
            {
                "url": "/stairville/sonicpulse-led-bar-05",
                "changefreq": "monthly",
                "lastmod": "2026-01-28T00:00:00.000Z"
            },
            {
                "url": "/stairville/sonicpulse-led-bar-10",
                "changefreq": "monthly",
                "lastmod": "2026-01-28T00:00:00.000Z"
            },
            {
                "url": "/stairville/stage-tri-led",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/stairville/vf-1200-dmx-vertifog-co2-fx",
                "changefreq": "monthly",
                "lastmod": "2022-07-19T00:00:00.000Z"
            },
            {
                "url": "/stairville/wild-wash-132-led-rgb-dmx",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/stairville/wild-wash-648-led-white-dmx",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/stairville/xbrick-full-colour",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/stairville/xbrick-quad-16x8w-rgbw",
                "changefreq": "monthly",
                "lastmod": "2023-10-09T00:00:00.000Z"
            },
            {
                "url": "/stairville/z120m-par-64-led-rgbw-120w",
                "changefreq": "monthly",
                "lastmod": "2022-01-29T00:00:00.000Z"
            },
            {
                "url": "/starway",
                "changefreq": "weekly"
            },
            {
                "url": "/starway/servo-color-4k",
                "changefreq": "monthly",
                "lastmod": "2020-03-29T00:00:00.000Z"
            },
            {
                "url": "/starway/stickolor-1210uhd",
                "changefreq": "monthly",
                "lastmod": "2019-03-04T00:00:00.000Z"
            },
            {
                "url": "/studio-due",
                "changefreq": "weekly"
            },
            {
                "url": "/studio-due/light-deflector",
                "changefreq": "monthly",
                "lastmod": "2024-11-23T00:00:00.000Z"
            },
            {
                "url": "/sun-star",
                "changefreq": "weekly"
            },
            {
                "url": "/sun-star/g-2011-nova",
                "changefreq": "monthly",
                "lastmod": "2018-12-08T00:00:00.000Z"
            },
            {
                "url": "/tecshow",
                "changefreq": "weekly"
            },
            {
                "url": "/tecshow/nebula-6",
                "changefreq": "monthly",
                "lastmod": "2026-01-30T00:00:00.000Z"
            },
            {
                "url": "/tecshow/nebula-18",
                "changefreq": "monthly",
                "lastmod": "2021-07-06T00:00:00.000Z"
            },
            {
                "url": "/tiptop-stage-light",
                "changefreq": "weekly"
            },
            {
                "url": "/tiptop-stage-light/3-10w-battery-led-wedge-par",
                "changefreq": "monthly",
                "lastmod": "2018-12-12T00:00:00.000Z"
            },
            {
                "url": "/tmb",
                "changefreq": "weekly"
            },
            {
                "url": "/tmb/solaris-flare",
                "changefreq": "monthly",
                "lastmod": "2018-08-09T00:00:00.000Z"
            },
            {
                "url": "/tomshine",
                "changefreq": "weekly"
            },
            {
                "url": "/tomshine/3-led-par-light-rgbuv",
                "changefreq": "monthly",
                "lastmod": "2024-10-09T00:00:00.000Z"
            },
            {
                "url": "/tomshine/80w-mini-gobo-moving-head",
                "changefreq": "monthly",
                "lastmod": "2026-01-30T00:00:00.000Z"
            },
            {
                "url": "/uking",
                "changefreq": "weekly"
            },
            {
                "url": "/uking/b117-par-can-4in1-rgbw-18-leds",
                "changefreq": "monthly",
                "lastmod": "2024-01-10T00:00:00.000Z"
            },
            {
                "url": "/uking/mini-led-spot-25w",
                "changefreq": "monthly",
                "lastmod": "2020-04-18T00:00:00.000Z"
            },
            {
                "url": "/uking/par-light-b262",
                "changefreq": "monthly",
                "lastmod": "2020-11-27T00:00:00.000Z"
            },
            {
                "url": "/uking/zq-b20-mini-spider-light",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/ultratec",
                "changefreq": "weekly"
            },
            {
                "url": "/ultratec/radiance-hazer",
                "changefreq": "monthly",
                "lastmod": "2022-02-26T00:00:00.000Z"
            },
            {
                "url": "/varytec",
                "changefreq": "weekly"
            },
            {
                "url": "/varytec/bat-par-6-rgbuv",
                "changefreq": "monthly",
                "lastmod": "2019-06-08T00:00:00.000Z"
            },
            {
                "url": "/varytec/bat-par-6-rgbwa",
                "changefreq": "monthly",
                "lastmod": "2019-06-08T00:00:00.000Z"
            },
            {
                "url": "/varytec/easy-move-xs-hp-wash-7x8w-rgbw",
                "changefreq": "monthly",
                "lastmod": "2021-06-17T00:00:00.000Z"
            },
            {
                "url": "/varytec/giga-bar-frost-pix-8-rgb",
                "changefreq": "monthly",
                "lastmod": "2022-10-12T00:00:00.000Z"
            },
            {
                "url": "/varytec/giga-bar-hex-3",
                "changefreq": "monthly",
                "lastmod": "2023-02-28T00:00:00.000Z"
            },
            {
                "url": "/varytec/hero-spot-230",
                "changefreq": "monthly",
                "lastmod": "2026-02-26T00:00:00.000Z"
            },
            {
                "url": "/varytec/hero-wash-340fx-rgbw-zoom",
                "changefreq": "monthly",
                "lastmod": "2023-07-12T00:00:00.000Z"
            },
            {
                "url": "/varytec/hero-wash-640fx",
                "changefreq": "monthly",
                "lastmod": "2026-02-02T00:00:00.000Z"
            },
            {
                "url": "/varytec/led-hellball-3-rgb",
                "changefreq": "monthly",
                "lastmod": "2020-02-19T00:00:00.000Z"
            },
            {
                "url": "/varytec/led-theater-spot-100",
                "changefreq": "monthly",
                "lastmod": "2026-01-30T00:00:00.000Z"
            },
            {
                "url": "/velleman",
                "changefreq": "weekly"
            },
            {
                "url": "/velleman/aeron-250-ii",
                "changefreq": "monthly",
                "lastmod": "2021-09-14T00:00:00.000Z"
            },
            {
                "url": "/venue",
                "changefreq": "weekly"
            },
            {
                "url": "/venue/thintri64",
                "changefreq": "monthly",
                "lastmod": "2018-07-21T00:00:00.000Z"
            },
            {
                "url": "/venue/tristrip3z",
                "changefreq": "monthly",
                "lastmod": "2018-08-24T00:00:00.000Z"
            },
            {
                "url": "/vrsl",
                "changefreq": "weekly"
            },
            {
                "url": "/vrsl/disco-ball",
                "changefreq": "monthly",
                "lastmod": "2026-01-03T00:00:00.000Z"
            },
            {
                "url": "/vrsl/flasher",
                "changefreq": "monthly",
                "lastmod": "2026-01-03T00:00:00.000Z"
            },
            {
                "url": "/categories/Barrel Scanner",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Blinder",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Color Changer",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Dimmer",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Effect",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Fan",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Flower",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Hazer",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Laser",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Matrix",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Moving Head",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Other",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Pixel Bar",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Scanner",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Smoke",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Stand",
                "changefreq": "weekly"
            },
            {
                "url": "/categories/Strobe",
                "changefreq": "weekly"
            },
            {
                "url": "/about/plugins/aglight",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins/color-chief",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins/colorsource",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins/d-light",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins/dmxcontrol3",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins/dragonframe",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins/ecue",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins/gdtf",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins/millumin",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins/ofl",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins/op-z",
                "changefreq": "monthly"
            },
            {
                "url": "/about/plugins/qlcplus_4.12.2",
                "changefreq": "monthly"
            }
        ],
        "sourceType": "user"
    },
    {
        "context": {
            "name": "nuxt:pages",
            "description": "Generated from your static page files.",
            "tips": [
                "Can be disabled with `{ excludeAppSources: ['nuxt:pages'] }`."
            ]
        },
        "urls": [
            {
                "loc": "/rdm"
            },
            {
                "loc": "/"
            },
            {
                "loc": "/search"
            },
            {
                "loc": "/about"
            },
            {
                "loc": "/manufacturers"
            },
            {
                "loc": "/fixture-editor"
            },
            {
                "loc": "/categories"
            },
            {
                "loc": "/about/plugins"
            },
            {
                "loc": "/import-fixture-file"
            }
        ],
        "sourceType": "app"
    }
];

export { sources };
//# sourceMappingURL=global-sources.mjs.map
