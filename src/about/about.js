import {
    anchor,
    article,
    div,
    emphasis,
    figure,
    figureCaption,
    heading2,
    image,
    paragraph
} from "../lib/html-elements.js";

import {articleTitle, pageFooter, pageHeader} from "../lib/page.js";


export function aboutPage() {
    return div({className: 'container'},
        pageHeader(),
        article({className: 'article'},
            articleTitle('About me (Dave Hudson)', '2024-05-29 07:45'),
            paragraph({},
                'Hello, good morning/afternoon/evening* and welcome! ',
                emphasis({}, '(*please delete as appropriate)')
            ),
            paragraph({},
                'I\'m an unrepentant geek who loves all things engineering, scientific or otherwise techie. ' +
                'I would say I love maths too, but I should probably leave that to the experts :-)'
            ),
            figure({},
                image({src: '/about/dave.jpg', alt: 'Me (apparently always pictured with a drink!)'}),
                figureCaption({}, 'Me (apparently always pictured with a drink!)')
            ),
            paragraph({},
                'I\'ve been playing with computers and writing software since I was 9 which is way more years than ' +
                'I care to think about. In that time I\'ve had the pleasure of working on everything from massive scale ' +
                'embedded systems (IoT before anyone called it that) to mainframes, and now to decentralised systems. ' +
                'Along the way, I stopped to build operating systems, network stacks, compilers. For a while I also ' +
                'helped design CPU instruction sets.'
            ),
            paragraph({},
                'Lately I\'ve been building blockchain and distributed ledger systems.'
            ),
            paragraph({},
                'That journey has led me all over the world and I\'ve had the privilege of collaborating with some ' +
                'amazing people.  I live in North Wales (UK), but for 17 years I “commuted” to Northern California. ' +
                'Now my travels tend to take me to London (UK) and Abu Dhabi (UAE).'
            ),
            heading2({}, 'Contact me'),
            paragraph({},
                'Please feel free to reach out to me on: ',
                anchor({href: 'mailto:hello@davehudson.io?subject=Email\ about\ davehudson.io'}, 'Email'), ', ',
                anchor({href: 'http://linkedin.com/in/davejh/'}, 'LinkedIn'), ', ',
                anchor({href: 'http://x.com/davehudsonio'}, 'X'), ', or ',
                anchor({href: 'http://instagram.com/davehudsonio'}, 'Instagram')
            )
        ),
        pageFooter()
    );
}
