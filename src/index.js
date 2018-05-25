import './index.css';

const btn = document.getElementById('btn');
console.log(btn);
btn.addEventListener('click', () => {
    import('./A.js');
});
