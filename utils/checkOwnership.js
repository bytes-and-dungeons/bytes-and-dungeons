module.exports = (user, character) => {
    if(character.owner._id.toString() === user._id.toString()){
        return true;
    } else {
        return false;
    }
}; 