#! /bin/sh

echo "Creating saves directory."

if test -d saves ; then 
    echo "saves directory already exists."
else 
    mkdir saves
    echo "'saves' created."
fi


if test -d saves/backups ; then 
    echo "saves/backups directory already exists."
else 
    mkdir saves/backups
    echo "'saves/backups' created."
fi

if test -f saves/save.json; then
    echo "Save file already exists."
else
    echo '{"cash":0, "givenCash":0, "lastProfits":[], "positions":[]}' > saves/save.json
    echo "'saves/save.json' created."
fi

echo "Saves directory created."
echo ""

echo "Creating logs directory."

if test -d logs ; then 
    echo "logs directory already exists."
else 
    mkdir logs
    echo "'logs' created."
fi

if test -d logs/account ; then
    echo "Logs/account directory already exists."
else
    mkdir logs/account
    echo "'logs/account' created."
fi

if test -d logs/orders ; then
    echo "Logs/orders directory already exists."
else
    mkdir logs/orders
    echo "'logs/orders' created."
fi

echo "Logs directory created."
echo ""

echo "Installing node packages."
npm install 
echo "Node packages installed."
echo ""

echo "Done."
