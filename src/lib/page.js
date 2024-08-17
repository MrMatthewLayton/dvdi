import {navigateEvent} from '/app.js';
import {gitHubIcon, instagramIcon, linkedInIcon, mailIcon, moonIcon, sunIcon, xIcon} from '/lib/icons.js';
import {anchor, button, footer, header, heading1, navigation, paragraph, time} from "./html-elements.js";

let darkTheme = null;
let darkModeSun = null;
let darkModeMoon = null;

function sunMoonIcon(isSun, clickCallback) {
    return button({
            className: 'icon',
            id: isSun ? 'dark-mode-sun' : 'dark-mode-moon',
            'aria-label': isSun ? 'Light mode' : 'Dark mode',
            onClick: () => clickCallback(!isSun)
        },
        isSun ? sunIcon() : moonIcon()
    )
}

export const pageHeader = () => {
    const component = () => header({className: 'header'},
        navigation({className: 'site-title'},
            heading1({},
                anchor({href: '/', onClick: (e) => navigateEvent(e, '/')}, 'davehudson.io')
            ),
            anchor({className: 'icon', href: 'https://instagram.com/davehudsonio', title: 'Instagram'},
                instagramIcon()
            ),
            anchor({className: 'icon', href: 'https://x.com/davehudsonio', title: 'X'},
                xIcon()
            ),
            anchor({className: 'icon', href: 'https://linkedin.com/in/davejh', title: 'LinkedIn'},
                linkedInIcon()
            ),
            anchor({className: 'icon', href: 'https://github.com/dave-hudson', title: 'GitHub'},
                gitHubIcon()
            ),
            anchor({
                    className: 'icon',
                    href: 'mailto:hello@davehudson.io?subject=Email\ about\ davehudson.io',
                    title: 'Email'
                },
                mailIcon(),
            )
        ),
        navigation({className: 'site-menu'},
            anchor({className: 'menu', href: '/blog', onClick: (e) => navigateEvent(e, '/blog')}, 'Blog'),
            anchor({className: 'menu', href: '/projects', onClick: (e) => navigateEvent(e, '/projects')}, 'Projects'),
            anchor({className: 'menu', href: '/about', onClick: (e) => navigateEvent(e, '/about')}, 'Me'),
            sunMoonIcon(false, setDarkTheme),
            sunMoonIcon(true, setDarkTheme)
        )
    );

    const windowMedia = window.matchMedia('(prefers-color-scheme: dark)');

    function setDarkTheme(dark) {
        if (dark === true) {
            darkModeSun.style.display = '';
            darkModeMoon.style.display = 'none';
            darkTheme.disabled = false;
            if (windowMedia.matches) {
                localStorage.removeItem('darkTheme');
            } else {
                localStorage.setItem('darkTheme', 'dark');
            }
        } else {
            darkModeSun.style.display = 'none';
            darkModeMoon.style.display = '';
            darkTheme.disabled = true;
            if (!windowMedia.matches) {
                localStorage.removeItem('darkTheme');
            } else {
                localStorage.setItem('darkTheme', 'light');
            }
        }
    }

    let vNode = component();
    vNode.mountCallback = () => {
        darkTheme = document.getElementById('dark-mode-theme');
        darkModeSun = document.getElementById('dark-mode-sun');
        darkModeMoon = document.getElementById('dark-mode-moon');

        // If we can, work out whether we should default to dark or light mode.
        let localDarkTheme = localStorage.getItem('darkTheme');
        if (localDarkTheme === null) {
            setDarkTheme(windowMedia.matches);
        } else {
            setDarkTheme(localDarkTheme === 'dark');
        }

        if (windowMedia.addEventListener) {
            windowMedia.addEventListener('change', () => {
                setDarkTheme(windowMedia.matches);
            });
        } else if (windowMedia.addListener) {
            windowMedia.addListener(() => {
                setDarkTheme(windowMedia.matches);
            });
        }
    }

    return vNode;
}

export const articleTitle = (title, timeStr = '') => {
    return header({className: 'title'},
        heading1({}, title),
        time({className: 'meta'}, timeStr)
    );
}

export const pageFooter = () => {
    return footer({className: 'footer'},
        paragraph({className: 'copyright'},
            '© 2014-2024 David J. Hudson'
        )
    );
}
