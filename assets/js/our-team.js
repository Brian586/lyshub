import team from "./data/team-data.js";

document.addEventListener("DOMContentLoaded", function () {
    // Team Section
    const teamList = document.getElementById("team-list");

    team.forEach((member) => {
        const teamMember = document.createElement("div");
        teamMember.className = "col-lg-4 col-md-6 col-sm-12 col-xs-12";

        teamMember.innerHTML = `
        <div class="team_box style_one">
            <div class="team_box_outer">
                <div class="member_image">
                    <img src="${member.image}" alt="${member.name}">
                </div>
                <div class="about_member">
                    <div class="share_media">
                        <ul class="first">
                        <li class="text">Links</li>
                        <li><i class="fa fa-share-alt"></i></li>
                        </ul>
                        <ul>
                        <li class="shar_alt"><i class="fa fa-share-alt"></i></li>
                        <li><a href="${member.socialLinks.linkedin}" target="_blank"> <i class="fa fa-linkedin"> </i></a></li>
                        <li><a href="${member.socialLinks.github}" target="_blank"> <i class="fa fa-github"> </i></a></li>
                        <li><a href="${member.socialLinks.website}" target="_blank"> <i class="fa fa-link"> </i></a></li>
                        </ul>
                    </div>
                    <div class="authour_details">
                        <span>${member.position}</span>
                        <h6>${member.name}</h6>
                        <div class="button_view">
                        <a href="${member.profile}" target="_blank" rel="nofollow" class="theme-btn one"> View Profile
                        </a>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            <div class="mr_bottom_30"></div>
        `;
        teamList.appendChild(teamMember);
    });
    // Team Section
});